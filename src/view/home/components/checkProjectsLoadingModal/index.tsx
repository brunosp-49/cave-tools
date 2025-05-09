import { Modal, View, StyleSheet, ActivityIndicator } from "react-native";
import React, { FC, useEffect, useCallback, useState, useRef } from "react"; // Added useRef
import TextInter from "../../../../components/textInter";
import { colors } from "../../../../assets/colors";
import { Divider } from "../../../../components/divider";
import { LongButton } from "../../../../components/longButton";
import NetInfo from "@react-native-community/netinfo";
import {
  createProjects,
  deleteAllCavities,
  deleteAllProjects,
  deleteUser,
  fetchAllProjects,
  fetchAllUsers,
  updateUser,
  fetchPendingCavityCount,
  fetchPendingProjectCount,
  syncPendingCavities,
  syncPendingProjects,
} from "../../../../db/controller";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../../api"; // Assuming it's configured
import JumpingIcon from "./jumpingIcon";
import ProgressBar from "../../../../components/progressBar";
import {
  getDaysUntilExpiration,
  isTokenAlmostExpired,
  isTokenExpired,
  refreshUserToken,
} from "../../../../util";
import { DefaultModal } from "../../../../components/modal/defaultModal";
import { useDispatch, useSelector } from "react-redux";
import store, { AppDispatch, RootState } from "../../../../redux/store";
import {
  resetModalState,
  setModalChecked,
  setModalExpirationWarning,
  setModalHasProjects,
  setModalLoading,
  setModalNetworkOff,
  setModalUserHasNotProjects,
} from "../../../../redux/userSlice";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { resetLoadingState } from "../../../../redux/loadingSlice";

type InitialCheckOutcome =
  | "CLOSED_SILENTLY"
  | "LOGGED_OFF"
  | "STAY_OPEN"
  | "ERROR_IN_CHECK"
  | "AUTO_UPLOAD_INITIATED";
type AutoUploadStatus = "idle" | "uploading" | "success" | "error";

interface CheckProjectsModalProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
}

export const CheckProjectsModal: FC<CheckProjectsModalProps> = ({
  visible,
  onClose,
  navigation,
}) => {
  const [isLoginOff, setIsLoginOff] = useState(false);
  const [initialCheckInvoked, setInitialCheckInvoked] = useState(false);

  const [autoUploadStatus, setAutoUploadStatus] =
    useState<AutoUploadStatus>("idle");
  const [autoUploadError, setAutoUploadError] = useState<string | null>(null);
  const autoUploadStatusRef = useRef(autoUploadStatus);

  useEffect(() => {
    autoUploadStatusRef.current = autoUploadStatus;
  }, [autoUploadStatus]);

  const dispatch: ThunkDispatch<RootState, unknown, any> =
    useDispatch<AppDispatch>();
  const {
    isLoading, // From userSlice, for the initial check phase
    hasProjects,
    checked,
    networkOff,
    userHasNotProjects,
    showExpirationWarning,
    daysToExpire,
  } = useSelector((state: RootState) => state.user);

  // For manual download progress bar if that UI is still shown
  const downloadCompleted = Boolean(
    !networkOff &&
      checked &&
      (hasProjects || userHasNotProjects) &&
      !isLoading &&
      autoUploadStatus === "idle"
  );

  const testConnection = useCallback(async () => {
    try {
      const state = await NetInfo.fetch();
      const isConnected = state.isConnected ?? false;
      dispatch(setModalNetworkOff(!isConnected));
      return isConnected;
    } catch (error) {
      console.error("NetInfo error:", error);
      dispatch(setModalNetworkOff(true));
      return false;
    }
  }, [dispatch]);

  const logoff = useCallback(async () => {
    try {
      setIsLoginOff(true);
      await deleteAllProjects();
      await deleteAllCavities();
      dispatch(resetModalState());
      dispatch(resetLoadingState());
      await deleteUser("2"); // FIXME: Hardcoded user ID
      navigation.navigate("Login");
      onClose();
    } catch (error) {
      console.error("Error during logoff:", error);
      dispatch(resetModalState());
    } finally {
      setIsLoginOff(false);
    }
  }, [dispatch, navigation, onClose]);

  // Manual project download, triggered by user action
  const downloadProjects = useCallback(async () => {
    const isConnected = await testConnection();
    if (!isConnected) return;

    dispatch(setModalLoading(true)); // Uses userSlice.isLoading for this manual operation
    try {
      const users = await fetchAllUsers();
      if (!users || users.length === 0 || !users[0]?.token) {
        dispatch(setModalNetworkOff(true));
        throw new Error("User or token not available");
      }
      const user = users[0];
      const { data } = await api.get("/projetos/usuario/", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (!data.results || !Array.isArray(data.results))
        throw new Error("Invalid project data format");

      if (data.results.length === 0) dispatch(setModalUserHasNotProjects(true));
      else {
        const projectsWithResponsavel = data.results.map((project: any) => ({
          ...project,
          responsavel: project.cliente.nome,
          fk_cliente: project.cliente.id,
        }));
        await createProjects(projectsWithResponsavel);
        dispatch(setModalHasProjects(true));
      }
      dispatch(setModalChecked(true)); // Mark as checked after download attempt
    } catch (error: any) {
      if (error.response && error.response.status === 401) await logoff();
      else dispatch(setModalNetworkOff(true));
      dispatch(setModalChecked(true));
    } finally {
      dispatch(setModalLoading(false));
    }
  }, [dispatch, testConnection, logoff]);

  const performAutoUpload = useCallback(
    async (cavCount: number, projCount: number): Promise<boolean> => {
      setAutoUploadStatus("uploading");
      setAutoUploadError(null);
      let overallSuccess = true;
      let errors: string[] = [];

      if (cavCount > 0) {
        const result = await syncPendingCavities();
        if (!result.success) {
          overallSuccess = false;
          errors.push(result.error || "Falha ao enviar cavidades.");
        }
      }
      if (overallSuccess && projCount > 0) {
        const result = await syncPendingProjects();
        if (!result.success) {
          overallSuccess = false;
          errors.push(result.error || "Falha ao enviar projetos.");
        }
      }

      if (overallSuccess) {
        setAutoUploadStatus("success");
        setTimeout(() => {
          if (visible && autoUploadStatusRef.current === "success") onClose();
        }, 1500); // Brief success message display
        return true;
      } else {
        setAutoUploadStatus("error");
        setAutoUploadError(errors.join(" \n"));
        return false;
      }
    },
    [onClose, visible]
  ); // `visible` prop from parent

  const initialCheck = useCallback(async (): Promise<InitialCheckOutcome> => {
    dispatch(setModalLoading(true)); // userSlice.isLoading for the check itself
    let outcome: InitialCheckOutcome = "STAY_OPEN" as InitialCheckOutcome;
    let localProjectsNowExist = false;
    let serverConfirmsNoProjectsInitially =
      store.getState().user.userHasNotProjects; // Snapshot before check
    let isCurrentlyOnline = false;
    let expirationWarningActive = false;

    try {
      const users = await fetchAllUsers();
      let currentUser = users.length > 0 ? users[0] : null;
      if (!currentUser) {
        await logoff();
        return "LOGGED_OFF";
      }

      isCurrentlyOnline = await NetInfo.fetch().then(
        (state) => state.isConnected ?? false
      );
      dispatch(setModalNetworkOff(!isCurrentlyOnline));

      if (isCurrentlyOnline && currentUser.last_login_date) {
        if (isTokenExpired(currentUser.last_login_date)) {
          try {
            const refreshed = await refreshUserToken(currentUser.refresh_token);
            await updateUser(String(currentUser.user_id), {
              token: refreshed.access,
              refresh_token: refreshed.refresh,
              last_login_date: String(new Date()),
            });
          } catch (refreshError) {
            await logoff();
            return "LOGGED_OFF";
          }
        } else if (isTokenAlmostExpired(currentUser.last_login_date)) {
          const daysLeft = getDaysUntilExpiration(currentUser.last_login_date);
          dispatch(setModalExpirationWarning({ show: true, days: daysLeft }));
          expirationWarningActive = true; // Mark that a warning is now active
        }
      }

      const localProjectsResult = await fetchAllProjects();
      localProjectsNowExist = localProjectsResult.length > 0;
      dispatch(setModalHasProjects(localProjectsNowExist));
      // Note: userHasNotProjects is typically set by downloadProjects if server confirms no projects.
      // For initialCheck, we mainly care about localProjectsExist and network state.
      serverConfirmsNoProjectsInitially =
        store.getState().user.userHasNotProjects; // Re-check after potential updates

      dispatch(setModalChecked(true)); // Mark the core checks as done
      outcome = "STAY_OPEN";
    } catch (error) {
      console.error("Error during initial check:", error);
      dispatch(setModalNetworkOff(true));
      dispatch(setModalChecked(true));
      outcome = "ERROR_IN_CHECK";
    } finally {
      dispatch(setModalLoading(false)); // Initial *check* phase (userSlice.isLoading) is done.

      if (outcome === "LOGGED_OFF") {
        // Logoff already called onClose, nothing more to do.
      } else {
        // --- Orchestration: Auto-upload or Silent Close ---
        let autoUploadInitiated = false;
        if (isCurrentlyOnline && autoUploadStatusRef.current === "idle") {
          const cavCount = await fetchPendingCavityCount();
          const projCount = await fetchPendingProjectCount();
          if (cavCount > 0 || projCount > 0) {
            // performAutoUpload will handle its own UI and call onClose on its success
            await performAutoUpload(cavCount, projCount);
            autoUploadInitiated = true;
            outcome = "AUTO_UPLOAD_INITIATED";
          }
        }

        // If an auto-upload was started and will handle closing, or if it errored and is showing UI, don't try to silently close here.
        // Only consider silent close if no auto-upload was initiated OR if auto-upload logic decided not to run (e.g. already errored).
        // The `autoUploadStatusRef.current` check ensures we don't conflict if auto-upload changed state.
        if (!autoUploadInitiated && autoUploadStatusRef.current === "idle") {
          // Fetch latest Redux state for decision, as `initialCheck` might have updated it.
          const currentReduxUser = store.getState().user; // Use with caution
          const projectsKnown =
            currentReduxUser.hasProjects || currentReduxUser.userHasNotProjects;

          // Conditions for silent close: everything is settled, no action/critical info for user.
          const canContinueOfflineWithProjects =
            !isCurrentlyOnline && currentReduxUser.hasProjects;
          const onlineAndProjectsKnownAndFine =
            isCurrentlyOnline && projectsKnown;

          if (
            (canContinueOfflineWithProjects || onlineAndProjectsKnownAndFine) &&
            outcome !== "ERROR_IN_CHECK" && // No error from the initial check itself
            !currentReduxUser.showExpirationWarning && // No active token warning
            !isLoading // Ensure userSlice.isLoading (for initial check) is false
          ) {
            console.log(
              "[CheckProjectsModal] Conditions met for silent close."
            );
            onClose();
            outcome = "CLOSED_SILENTLY";
          }
        }
      }
    }
    return outcome;
  }, [dispatch, logoff, onClose, performAutoUpload]);

  useEffect(() => {
    if (visible) {
      if (!initialCheckInvoked) {
        setInitialCheckInvoked(true);
        initialCheck().then((outcome) => {
          if (!visible || autoUploadStatusRef.current !== "idle") return;
          if (
            outcome === "LOGGED_OFF" ||
            outcome === "CLOSED_SILENTLY" ||
            outcome === "AUTO_UPLOAD_INITIATED"
          )
            return;

          // If initialCheck decided to stay open, and no auto-upload took over,
          // the modal will render its UI based on Redux state.
          console.log(
            "[CheckProjectsModal] initialCheck completed, outcome:",
            outcome,
            "Modal remains for UI display."
          );
        });
      }
    } else {
      setInitialCheckInvoked(false);
      setAutoUploadStatus("idle");
      // setAutoUploadProgress(0); // Progress is for the autoUpload component itself
      setAutoUploadError(null);
    }
  }, [visible, initialCheck, initialCheckInvoked, performAutoUpload, dispatch]);

  // --- RENDER LOGIC ---
  if (autoUploadStatus === "uploading") {
    return (
      <Modal
        visible={true}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <TextInter
              color={colors.white[90]}
              fontSize={23}
              style={styles.title}
            >
              Sincronizando Dados
            </TextInter>
            <Divider height={16} />
            <ActivityIndicator size={70} color={colors.accent[100]} />
            <Divider height={16} />
            <TextInter
              color={colors.dark[20]}
              weight="regular"
              style={styles.message}
            >
              Enviando dados pendentes... Por favor, aguarde.
            </TextInter>
          </View>
        </View>
      </Modal>
    );
  }
  if (autoUploadStatus === "success") {
    return (
      <Modal
        visible={true}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Ionicons
              name="checkmark-circle-outline"
              size={70}
              color={colors.accent[100]}
            />
            <Divider height={16} />
            <TextInter
              color={colors.white[90]}
              fontSize={20}
              style={styles.title}
            >
              Sincronização Concluída
            </TextInter>
            <Divider height={10} />
            <TextInter color={colors.dark[20]} style={styles.message}>
              Dados enviados com sucesso!
            </TextInter>
          </View>
        </View>
      </Modal>
    );
  }
  if (autoUploadStatus === "error") {
    return (
      <Modal
        visible={true}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={70}
              color={colors.error[100]}
            />
            <Divider height={16} />
            <TextInter
              color={colors.white[90]}
              fontSize={20}
              style={styles.title}
            >
              Erro na Sincronização
            </TextInter>
            <Divider height={10} />
            <TextInter color={colors.dark[20]} style={styles.message}>
              {autoUploadError || "Falha no envio."}
            </TextInter>
            <Divider />
            <LongButton title="Fechar" onPress={onClose} mode="cancel" />
          </View>
        </View>
      </Modal>
    );
  }

  // Main modal content when autoUploadStatus is 'idle'
  return (
    <Modal
      visible={visible} // Controlled by parent, shown only if autoUploadStatus is 'idle'
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!isLoading && !isLoginOff) onClose();
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {isLoading ? ( // isLoading from userSlice, for the initialCheck phase
            <>
              <TextInter
                color={colors.white[90]}
                fontSize={23}
                style={styles.title}
              >
                {checked ? "Verificação Concluída" : "Verificando dados..."}
              </TextInter>
              <Divider height={16} />
              {checked ? (
                <JumpingIcon />
              ) : (
                <ActivityIndicator size={70} color={colors.accent[100]} />
              )}
              <Divider height={16} />
              {checked && (
                <ProgressBar finished={downloadCompleted && !isLoading} />
              )}
              <TextInter
                color={colors.dark[20]}
                weight="regular"
                style={styles.message}
              >
                {checked ? "Aguarde..." : "Aguarde alguns segundos"}
              </TextInter>
            </>
          ) : userHasNotProjects ? (
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
                Não há projetos vinculados ao seu usuário.
              </TextInter>
              <Divider />
              <LongButton
                title="Sair"
                onPress={logoff}
                isLoading={isLoginOff}
              />
            </>
          ) : // This "Projetos Carregados" state will only show if silent close conditions were NOT met (e.g., token warning active)
          hasProjects && checked ? (
            <>
              <TextInter
                color={colors.white[90]}
                fontSize={23}
                style={styles.title}
              >
                Projetos Disponíveis
              </TextInter>
              <Divider height={16} />
              <Ionicons
                name="checkmark-circle-outline"
                color={colors.accent[100]}
                size={70}
              />
              <Divider height={16} />
              <TextInter
                color={colors.dark[20]}
                weight="regular"
                style={styles.message}
              >
                Seus projetos estão carregados localmente.
              </TextInter>
              <Divider />
              <LongButton title="Ok, entendi" onPress={onClose} />
            </>
          ) : checked && !hasProjects && !networkOff ? ( // Prompt for manual download
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
                Deseja baixar os projetos vinculados ao seu usuário?
              </TextInter>
              <Divider />
              <LongButton
                disabled={isLoginOff || isLoading}
                isLoading={isLoading}
                title="Baixar Projetos"
                onPress={downloadProjects}
              />
              <Divider height={8} />
              <LongButton
                disabled={isLoginOff || isLoading}
                isLoading={isLoginOff}
                title="Sair"
                onPress={logoff}
              />
            </>
          ) : checked && networkOff ? ( // Offline message
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
                  ? "Trabalhando offline. Dados pendentes não puderam ser enviados."
                  : "Conecte-se para baixar projetos e enviar dados."}
              </TextInter>
              <Divider />
              <LongButton
                title={hasProjects ? "Continuar Offline" : "Sair"}
                onPress={hasProjects ? onClose : logoff}
                isLoading={isLoginOff}
              />
            </>
          ) : (
            // Fallback / Initial un-checked state (should be brief)
            <>
              <TextInter
                color={colors.white[90]}
                fontSize={18}
                style={styles.title}
              >
                Carregando Informações...
              </TextInter>
              <ActivityIndicator size="large" color={colors.accent[100]} />
            </>
          )}
        </View>
      </View>

      <DefaultModal
        isOpen={showExpirationWarning}
        onClose={() =>
          dispatch(setModalExpirationWarning({ show: false, days: 0 }))
        }
        title={`Atenção! Sua sessão expira em ${daysToExpire} ${
          daysToExpire === 1 ? "dia" : "dias"
        }`}
        message="Recomendamos sincronizar seus dados. Se a sessão expirar, precisará fazer login novamente."
        titleButtonConfirm="Entendi"
        onConfirm={() =>
          dispatch(setModalExpirationWarning({ show: false, days: 0 }))
        }
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(0,0,0,0.6)",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    backgroundColor: colors.dark[30],
    width: "90%",
    maxWidth: 400,
    minHeight: 280,
    borderRadius: 16,
    justifyContent: "center",
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
    fontWeight: "600",
  },
  message: {
    textAlign: "center",
    paddingHorizontal: 10,
    lineHeight: 20,
  },
});
