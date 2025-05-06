import { Modal, View, StyleSheet, ActivityIndicator } from "react-native";
import React, { FC, useEffect, useCallback } from "react"; // Removed useState, added React/useCallback
import TextInter from "../../../../components/textInter"; // Adjust path as needed
import { colors } from "../../../../assets/colors"; // Adjust path as needed
import { Divider } from "../../../../components/divider"; // Adjust path as needed
import { LongButton } from "../../../../components/longButton"; // Adjust path as needed
import NetInfo from "@react-native-community/netinfo";
import {
  createProjects,
  deleteAllCavities,
  deleteAllProjects,
  deleteUser,
  fetchAllProjects,
  fetchAllUsers,
  updateUser,
} from "../../../../db/controller"; // Adjust path as needed
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../../api"; // Adjust path as needed
import JumpingIcon from "./jumpingIcon"; // Adjust path as needed
import ProgressBar from "../../../../components/progressBar"; // Adjust path as needed
import {
  getDaysUntilExpiration,
  isTokenAlmostExpired,
  isTokenExpired,
  refreshUserToken,
} from "../../../../util"; // Adjust path as needed
import { DefaultModal } from "../../../../components/modal/defaultModal"; // Adjust path as needed
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../redux/store"; // Adjust path as needed
import {
  // Import actions from the slice
  resetModalState,
  setModalChecked,
  setModalExpirationWarning,
  setModalHasProjects,
  setModalLoading,
  setModalNetworkOff,
  setModalUserHasNotProjects,
  // setModalVisibility, // Only needed if controlling visibility via Redux
} from "../../../../redux/userSlice"; // Adjust path as needed
import { ThunkDispatch } from "@reduxjs/toolkit"; // Import ThunkDispatch type
import {
  resetLoadingState,
  setIsCheckingLoading,
} from "../../../../redux/loadingSlice";

interface CheckProjectsModalProps {
  visible: boolean; // Assuming parent controls visibility
  onClose: () => void; // To inform parent to close (hide) the modal
  navigation: any; // For navigating on logoff
}

export const CheckProjectsModal: FC<CheckProjectsModalProps> = ({
  visible,
  onClose,
  navigation,
}) => {
  const [isLoginOff, setIsLoginOff] = React.useState(false);
  // --- Use Redux State ---
  // Explicitly type dispatch for potentially handling thunks if needed in future
  const dispatch: ThunkDispatch<RootState, unknown, any> =
    useDispatch<AppDispatch>(); // Use ThunkDispatch or AppDispatch
  const {
    isLoading,
    hasProjects,
    checked,
    networkOff,
    userHasNotProjects,
    showExpirationWarning,
    daysToExpire,
    // isModalVisible // Use this if controlling visibility via Redux
  } = useSelector((state: RootState) => state.user);

  const downloadCompleted = Boolean(
    !networkOff && checked && (hasProjects || userHasNotProjects) && !isLoading
  );

  // --- Helper Functions ---
  const testConnection = useCallback(async () => {
    try {
      const state = await NetInfo.fetch();
      const isConnected = state.isConnected ?? false;
      dispatch(setModalNetworkOff(!isConnected)); // Update state directly
      return isConnected;
    } catch (error) {
      console.error("NetInfo error:", error);
      dispatch(setModalNetworkOff(true)); // Assume offline on error
      return false;
    }
  }, [dispatch]);

  const logoff = useCallback(async () => {
    try {
      setIsLoginOff(true);
      await deleteAllProjects();
      await deleteAllCavities();
      dispatch(resetModalState());
      dispatch(resetLoadingState()); // <<< Reset Redux state for the modal
      await deleteUser("2"); // FIXME: Hardcoded user ID '2'
      navigation.navigate("Login"); // Navigate AFTER resetting state
      onClose();
      setIsLoginOff(false);
    } catch (error) {
      setIsLoginOff(false);
      console.error("Error during logoff:", error);
      // Reset state even on error to ensure clean state? Or leave as is?
      // dispatch(resetModalState());
    }
    // No finally needed for loading as resetModalState sets it to false
  }, [dispatch, navigation, onClose]);

  const downloadProjects = useCallback(async () => {
    const isConnected = await testConnection();
    if (!isConnected) {
      // Network state already set by testConnection
      console.log("Download skipped: No network connection.");
      return;
    }

    dispatch(setModalLoading(true));
    try {
      const users = await fetchAllUsers();
      if (!users || users.length === 0 || !users[0]?.token) {
        console.error("User or token not found for downloading projects.");
        dispatch(setModalNetworkOff(true)); // Treat as network/config issue
        throw new Error("User or token not available"); // Throw to be caught below
      }
      const user = users[0];
      console.log(`Downloading projects for user ${user.user_id}...`);

      const { data } = await api.get("/projetos/usuario/", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      console.log({data})
      if (!data.results || !Array.isArray(data.results)) {
        console.warn("Unexpected API response format for projects:", data);
        throw new Error("Invalid project data format from server");
      }

      if (data.results.length === 0) {
        console.log("User has no projects assigned on the server.");
        dispatch(setModalUserHasNotProjects(true));
      } else {
        console.log(`Found ${data.results.length} projects. Saving locally...`);
        await createProjects(data.results); // Save fetched projects
        dispatch(setModalHasProjects(true)); // Mark that projects now exist locally
      }
      dispatch(setModalChecked(true)); // Mark check as complete
    } catch (error: any) {
      console.error("Error downloading projects:", error);
      // Handle specific errors like 401 Unauthorized (token expired)
      if (error.response && error.response.status === 401) {
        console.error(
          "Authorization failed (401). Token might be expired. Logging off."
        );
        // Token is likely invalid/expired, force logoff
        await logoff(); // Use the logoff function which handles state reset + navigation
      } else {
        // For other errors, assume network issue for UI feedback
        dispatch(setModalNetworkOff(true));
      }
      // Ensure checked is true even on error to move past loading state if needed
      // Or handle error state explicitly
      dispatch(setModalChecked(true));
    } finally {
      dispatch(setModalLoading(false)); // Always turn off loading indicator
    }
  }, [dispatch, testConnection, logoff]); // Added logoff dependency

  // --- Initial Check Logic ---
  const initialCheck = useCallback(async () => {
    let shouldCloseModalSilently = false;
    dispatch(setModalLoading(true)); // Start loading for the check itself
    console.log("Modal: Running initial check...");

    try {
        const users = await fetchAllUsers();
        let currentUser = users.length > 0 ? users[0] : null;
        console.log({ users });

        // --- User Existence Check ---
        if (!currentUser) {
            console.log("Modal: No local user found during initial check. Logging off.");
            await logoff(); // If no user, force back to login
            return; // Stop processing this check
        }
        console.log("Modal: User found locally.");

        // --- Connectivity Check (needed for token checks) ---
        const isOnline = await NetInfo.fetch().then(state => state.isConnected ?? false);
        // Update network state once, unless we close silently
        if (!isOnline) {
             dispatch(setModalNetworkOff(true));
        }


        // --- Token Checks (only if online and login date exists) ---
        if (isOnline && currentUser.last_login_date) {
            if (isTokenExpired(currentUser.last_login_date)) {
                console.log("Token expired, attempting refresh...");
                try {
                    const refreshed = await refreshUserToken(currentUser.refresh_token);
                    await updateUser(currentUser.user_id, { /* ... update details ... */ });
                    console.log("Token refreshed successfully.");
                    currentUser = { ...currentUser, token: refreshed.access, /*...*/ }; // Update local copy
                } catch (refreshError) {
                    console.error("Fatal: Error refreshing token:", refreshError);
                    await logoff(); // Force logout on refresh failure
                    return; // Stop processing
                }
            } else if (isTokenAlmostExpired(currentUser.last_login_date)) {
                const daysLeft = getDaysUntilExpiration(currentUser.last_login_date);
                console.log(`Token expiring in ${daysLeft} days.`);
                dispatch(setModalExpirationWarning({ show: true, days: daysLeft }));
            }
        } else if (!currentUser.last_login_date) {
            console.warn("User found but no last_login_date. Cannot check token status.");
        }
        // --- End Token Checks ---


        // --- Project Check ---
        const projects = await fetchAllProjects();
        if (projects.length > 0) {
            console.log("Modal: Found existing local projects. Token OK (or offline/no date). Closing modal silently.");
            dispatch(setModalHasProjects(true)); // Set state accurately
            dispatch(setModalChecked(true));    // Mark as checked
            shouldCloseModalSilently = true;   // <<<< FLAG TO CLOSE
        } else {
            console.log("Modal: No local projects found. Modal will remain open to prompt action.");
            dispatch(setModalHasProjects(false)); // Set state accurately
            dispatch(setModalChecked(true));     // Mark as checked
             // Ensure network state is correct here if not set earlier
            dispatch(setModalNetworkOff(!isOnline));
            // No silent close, let the UI prompt for download or show offline
        }
        // --- End Project Check ---

    } catch (error) {
        console.error("Error during initial check:", error);
        dispatch(setModalNetworkOff(true)); // Assume connectivity issue on general error?
        dispatch(setModalChecked(true)); // Ensure we move past loading
    } finally {
        dispatch(setModalLoading(false)); // Turn off loading indicator regardless of path
        // --- Close Modal Silently if Flagged ---
        if (shouldCloseModalSilently) {
            console.log("Closing modal silently NOW.");
            onClose(); // <<<< CLOSE THE MODAL
        }
        // --- ---
    }
  }, [dispatch, logoff, onClose]);

  // --- Effect to run Initial Check ---
  useEffect(() => {
    // Only run the check if the modal becomes visible
    if (visible) {
      console.log("Modal became visible, running initial check.");
      initialCheck();
    } else {
      console.log("Modal is not visible, skipping initial check.");
      console.log({ visible });
      // Optional: Reset state when modal becomes invisible?
      // Or rely on reset during logoff.
      // dispatch(resetModalState()); // Could cause issues if modal briefly hides/shows
    }
    // Run when visibility changes
  }, [visible, initialCheck]);

  // --- Event Handlers ---
  const handleConfirmExpiration = () => {
    dispatch(setModalExpirationWarning({ show: false, days: 0 })); // Hide warning
    // Decide if closing the main modal is desired here
    // onClose();
  };

  const handleRetryDownload = () => {
    // Reset network off state before attempting download again
    dispatch(setModalNetworkOff(false));
    downloadProjects();
  };

  // --- Render Logic ---
  return (
    <Modal
      visible={visible} // Controlled by parent prop
      transparent
      animationType="fade"
      onRequestClose={onClose} // Handle back button on Android
    >
      <View style={styles.overlay}>
        <View
          style={
            // Dynamically adjust style based on state? Or keep consistent?
            // Using modalContainer for all states after initial 'checked' for consistency
            checked || isLoading || networkOff || userHasNotProjects
              ? styles.modalContainer
              : styles.modalContainerChecking
          }
        >
          {/* --- Render based on Redux state --- */}

          {/* State: Initial Check or Loading in Progress */}
          {isLoading ? (
            <>
              <TextInter
                color={colors.white[90]}
                fontSize={23}
                style={styles.title}
              >
                {checked ? "Download em andamento" : "Verificando dados..."}
              </TextInter>
              <Divider height={16} />
              {checked ? (
                <JumpingIcon />
              ) : (
                <ActivityIndicator size={70} color={colors.accent[100]} />
              )}
              <Divider height={16} />
              {checked && <ProgressBar finished={downloadCompleted} />}
              <TextInter
                color={colors.dark[20]}
                weight="regular"
                style={styles.message}
              >
                {checked
                  ? "Aguarde até o final do download"
                  : "Aguarde alguns segundos"}
              </TextInter>
            </>
          ) : /* State: Check Complete, User Has No Projects on Server */
          userHasNotProjects ? (
            <>
              <TextInter
                color={colors.white[90]}
                fontSize={23}
                style={styles.title}
              >
                Nenhum projeto encontrado
              </TextInter>
              <Divider height={16} />
              <Ionicons
                name="sad-outline"
                color={colors.accent[100]}
                size={70}
              />
              <Divider height={16} />
              <TextInter
                color={colors.dark[20]}
                weight="regular"
                style={styles.message}
              >
                Não há projetos vinculados ao seu usuário. Por favor, crie um
                projeto ou peça um convite.
              </TextInter>
              <Divider />
              <LongButton
                title="Sair"
                onPress={logoff}
                isLoading={isLoginOff}
              />
            </>
          ) : /* State: Download Completed Successfully */
          downloadCompleted && hasProjects && checked ? (
            <>
              <TextInter
                color={colors.white[90]}
                fontSize={23}
                style={styles.title}
              >
                Download concluído
              </TextInter>
              <Divider height={16} />
              <Ionicons
                name="checkmark-circle-outline"
                color={colors.accent[100]}
                size={70}
              />
              <Divider height={16} />
              <ProgressBar finished={true} />
              <TextInter
                color={colors.dark[20]}
                weight="regular"
                style={styles.message}
              >
                Projetos salvos localmente. Agora você pode trabalhar offline.
              </TextInter>
              <Divider />
              <LongButton title="Ok, entendi" onPress={onClose} />
            </>
          ) : /* State: Checked, No Local Projects, Online -> Prompt Download */
          checked && !hasProjects && !networkOff ? (
            <>
              <TextInter
                color={colors.white[90]}
                fontSize={23}
                style={styles.title}
              >
                Projetos não encontrados localmente
              </TextInter>
              <Divider height={16} />
              <Ionicons
                name="cloud-download-outline"
                color={colors.dark[60]}
                size={70}
              />
              <Divider height={16} />
              <TextInter
                color={colors.dark[20]}
                weight="regular"
                style={styles.message}
              >
                Deseja baixar os projetos vinculados ao seu usuário para acesso
                offline?
              </TextInter>
              <Divider />
              <LongButton
                disabled={isLoginOff}
                isLoading={isLoading} // Should be false here, but keep for consistency
                title="Baixar Projetos"
                onPress={downloadProjects}
              />
              <Divider height={8} />
              <LongButton
                isLoading={isLoading || isLoginOff} // Should be false here, but keep for consistency
                title="Sair"
                onPress={logoff} // Allow user to log off if they don't want to download
              />
            </>
          ) : /* State: Checked, Network is Offline */
          /* This covers both: no local projects + offline, AND existing local projects + offline */
          checked && networkOff ? (
            <>
              <TextInter
                color={colors.white[90]}
                fontSize={23}
                style={styles.title}
              >
                Você está sem internet
              </TextInter>
              <Divider height={16} />
              <Ionicons
                name="cloud-offline-outline"
                color={colors.dark[60]}
                size={70}
              />
              <Divider height={16} />
              <TextInter
                color={colors.dark[20]}
                weight="regular"
                style={styles.message}
              >
                {hasProjects
                  ? "Não é possível verificar atualizações ou baixar novos projetos offline."
                  : "Conecte-se à internet para baixar seus projetos pela primeira vez."}
              </TextInter>
              <Divider />
              <LongButton
                disabled={isLoginOff}
                title="Tentar novamente"
                onPress={handleRetryDownload} // Use handler to reset state first
              />
              <Divider height={8} />
              <LongButton
                title={hasProjects ? "Continuar Offline" : "Sair"}
                onPress={hasProjects ? onClose : logoff}
                isLoading={isLoginOff} // Close modal or log off
              />
            </>
          ) : (
            /* Fallback / Unexpected State (Should ideally not be reached) */
            <>
              <TextInter
                color={colors.white[90]}
                fontSize={18}
                style={styles.title}
              >
                Carregando...
              </TextInter>
              <ActivityIndicator size="large" color={colors.accent[100]} />
            </>
          )}
        </View>
      </View>

      {/* --- Expiration Warning Modal --- */}
      <DefaultModal
        isOpen={showExpirationWarning} // Use Redux state
        onClose={() =>
          dispatch(setModalExpirationWarning({ show: false, days: 0 }))
        } // Close just this modal
        title={`Atenção! Sua sessão expira em ${daysToExpire} ${
          daysToExpire === 1 ? "dia" : "dias"
        }`}
        message="Recomendamos sincronizar seus dados cadastrados em breve. Se a sessão expirar, você precisará fazer login novamente."
        titleButtonConfirm="Entendi"
        onConfirm={handleConfirmExpiration}
        // hideCancelButton={true} // Optional: if only OK is needed
      />
    </Modal>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(0,0,0,0.6)", // Slightly darker overlay
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    backgroundColor: colors.dark[30],
    width: "90%",
    maxWidth: 400, // Max width for larger screens
    minHeight: 280, // Min height for content
    borderRadius: 16, // Slightly softer corners
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 30,
    shadowColor: "#000", // Added shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // Style used ONLY during the very initial check before 'checked' is true
  modalContainerChecking: {
    backgroundColor: colors.dark[30],
    width: "90%",
    maxWidth: 400,
    height: "auto", // Auto height
    minHeight: 280,
    borderRadius: 16,
    justifyContent: "center", // Center content
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    textAlign: "center",
    fontWeight: "600", // Make title bolder
  },
  message: {
    textAlign: "center",
    paddingHorizontal: 10, // Reduced padding slightly
    lineHeight: 20, // Improved readability
  },
});
