import {
  Modal,
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { FC, useEffect, useCallback, useState, useRef } from "react";
import TextInter from "../../../../components/textInter";
import { colors } from "../../../../assets/colors";
import { Divider } from "../../../../components/divider";
import { LongButton } from "../../../../components/longButton";
import NetInfo from "@react-native-community/netinfo";
import {
  deleteAllCavities,
  deleteAllProjects,
  deleteUser,
  fetchAllProjects,
  fetchAllUsers,
  updateUser,
  getProjectsWithPendingCavitiesCount,
  fetchProjectsWithPendingCavities,
  syncConsolidatedUpload,
  createProjects,
  createCavitiesFromServer,
  FailedCavity,
  fetchAllCavities,
  createTopographiesFromServer,
  deleteAllTopographies,
} from "../../../../db/controller";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../../../api";
import JumpingIcon from "./jumpingIcon";
import ProgressBar from "../../../../components/progressBar";
import {
  getDaysUntilExpiration,
  isTokenAlmostExpired,
  isTokenExpired,
  refreshUserToken,
  requestLocationPermissions,
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
import { resetLoadingState, showError } from "../../../../redux/loadingSlice";
import UploadProgressBar from "../../../../components/progressBar/uploadProgressBar";

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
  const [autoUploadFailedCavities, setAutoUploadFailedCavities] = useState<
    FailedCavity[]
  >([]);
  const [autoUploadProgress, setAutoUploadProgress] = useState(0);
  const autoUploadStatusRef = useRef(autoUploadStatus); // Ref to hold latest status

  // Update ref whenever autoUploadStatus changes
  useEffect(() => {
    autoUploadStatusRef.current = autoUploadStatus;
  }, [autoUploadStatus]);

  const dispatch: ThunkDispatch<RootState, unknown, any> =
    useDispatch<AppDispatch>();
  const {
    isLoading,
    hasProjects,
    checked,
    networkOff,
    userHasNotProjects,
    showExpirationWarning,
    daysToExpire,
  } = useSelector((state: RootState) => state.user);

  const downloadCompleted = Boolean(
    !networkOff &&
      checked &&
      (hasProjects || userHasNotProjects) &&
      !isLoading &&
      autoUploadStatus === "idle" // Only consider download complete if auto-upload is not active
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
      console.log("[LOGOFF] Iniciando processo de limpeza...");

      // MUDANÇA: Apagando topografias PRIMEIRO para isolar o problema
      console.log("[LOGOFF] Tentando apagar topografias...");
      await deleteAllTopographies();
      console.log("[LOGOFF] Etapa deleteAllTopographies concluída.");

      console.log("[LOGOFF] Tentando apagar projetos...");
      await deleteAllProjects();
      console.log("[LOGOFF] Etapa deleteAllProjects concluída.");

      const users = await fetchAllUsers();
      if (users.length > 0 && users[0].user_id) {
        console.log("[LOGOFF] Tentando apagar usuário...");
        await deleteUser(String(users[0].user_id));
        console.log("[LOGOFF] Etapa deleteUser concluída.");
      }

      dispatch(resetModalState());
      dispatch(resetLoadingState());
      navigation.navigate("Login");
      onClose();
      console.log("[LOGOFF] Processo de limpeza finalizado com sucesso.");
    } catch (error) {
      console.error("[LOGOFF] ERRO DURANTE O LOGOFF:", error);
      // Mesmo em caso de erro, tenta seguir o fluxo para não prender o usuário
      dispatch(resetModalState());
      navigation.navigate("Login");
      onClose();
    } finally {
      setIsLoginOff(false);
    }
  }, [dispatch, navigation, onClose]);

  const downloadProjects = useCallback(async () => {
    const isConnected = await testConnection();
    if (!isConnected) return;

    dispatch(setModalLoading(true));
    try {
      const users = await fetchAllUsers();
      if (!users || users.length === 0 || !users[0]?.token) {
        dispatch(setModalNetworkOff(true)); // Set network off if no user/token
        throw new Error("User or token not available for project download.");
      }
      const user = users[0];

      // 1. Download Projects
      const projectsResponse = await api.get("/projetos/usuario/", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      console.log({ projectsResponse });
      const projectsFromServer = projectsResponse.data.results;

      if (!projectsFromServer || !Array.isArray(projectsFromServer)) {
        throw new Error("Invalid project data format from server.");
      }

      if (projectsFromServer.length === 0) {
        dispatch(setModalUserHasNotProjects(true));
      } else {
        const projectsToCreate = projectsFromServer.map((project: any) => ({
          id: String(project.id), // Ensure ID is string for WatermelonDB
          fk_cliente: String(project.cliente.id),
          projeto_id: String(project.id), // Assuming this is the unique identifier
          register_id: project.register_id, // Assuming this field is relevant for your ProjectPayload
          nome_projeto: project.nome_projeto,
          inicio: project.inicio,
          descricao_projeto: project.descricao_projeto,
          status: project.status, // Assuming default status
        }));
        console.log(projectsToCreate);
        await createProjects(projectsToCreate); // This function now handles create/update
        dispatch(setModalHasProjects(true));

        // 2. Download Cavities associated with these projects
        const cavitiesResponse = await api.get("/cavidades/cavidades-usuario", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const cavitiesFromServer = cavitiesResponse.data.results;

        if (!cavitiesFromServer || !Array.isArray(cavitiesFromServer)) {
          console.warn(
            "No cavities or invalid cavities data format from server."
          );
        } else {
          await createCavitiesFromServer(cavitiesFromServer);
          console.log(
            `Downloaded and saved ${cavitiesFromServer.length} cavities.`
          );
        }
      }
      // 3- topography
      try {
        const topographiesResponse = await api.get("/medicoes-topograficas/", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        console.log({ topographiesResponse });
        const topographiesFromServer = topographiesResponse.data.results;

        if (topographiesFromServer && Array.isArray(topographiesFromServer)) {
          await createTopographiesFromServer(topographiesFromServer);
          console.log(
            `Downloaded and saved ${topographiesFromServer.length} topographies.`
          );
        } else {
          console.warn(
            "No topographies or invalid topographies data format from server."
          );
        }
      } catch (topoError) {
        // Não quebra o fluxo principal se as topografias falharem, mas loga o erro.
        console.error(
          "Failed to download topographies during initial check:",
          topoError
        );
      }
      dispatch(setModalChecked(true)); // Mark check as complete after download attempt
    } catch (error: any) {
      console.error("Error downloading projects/cavities:", error);
      if (error.response && error.response.status === 401) {
        logoff(); // Log off if unauthorized
      } else {
        dispatch(setModalNetworkOff(true)); // Indicate network issue or other error
      }
      dispatch(setModalChecked(true)); // Still mark as checked, but with an error state
    } finally {
      dispatch(setModalLoading(false));
    }
  }, [dispatch, testConnection, logoff]);

  const performAutoUpload = useCallback(async (): Promise<boolean> => {
    setAutoUploadStatus("uploading");
    setAutoUploadError(null);
    setAutoUploadFailedCavities([]);
    setAutoUploadProgress(1); // Start progress at 1%
    let overallSuccess = true;

    try {
      const projectsToSync = await fetchProjectsWithPendingCavities();
      if (projectsToSync.length > 0) {
        const result = await syncConsolidatedUpload(
          projectsToSync,
          (progress) => {
            setAutoUploadProgress(progress);
          }
        );
        if (!result.success) {
          overallSuccess = false;
          setAutoUploadError(result.error || "Falha no envio automático.");
          setAutoUploadFailedCavities(result.failedCavities || []);
        }
      } else {
        setAutoUploadProgress(100); // No projects to sync, so it's a success
      }
    } catch (error: any) {
      overallSuccess = false;
      const msgToDisplay =
        typeof error.message === "string"
          ? error.message
          : JSON.stringify(error);
      setAutoUploadError(
        `Erro ao preparar dados para envio automático: ${msgToDisplay}`
      );
      console.error("Error in performAutoUpload preparation:", error);
    }

    if (overallSuccess) {
      setAutoUploadStatus("success");
      setTimeout(() => {
        // Only close if modal is still visible and status hasn't changed
        if (visible && autoUploadStatusRef.current === "success") {
          onClose();
        }
      }, 1500); // Give a brief moment for success message to be seen
      return true;
    } else {
      setAutoUploadStatus("error");
      return false;
    }
  }, [onClose, visible]);

  const getProjectsAndCavities = async (line: number) => {
    const projects = await fetchAllProjects();
    const cavities = await fetchAllCavities();

    console.log({ projects, cavities, line });
  };

  const initialCheck = useCallback(async (): Promise<InitialCheckOutcome> => {
    await getProjectsAndCavities(258);
    let currentOutcomeStatus: InitialCheckOutcome = "STAY_OPEN";
    dispatch(setModalLoading(true));
    await getProjectsAndCavities(260);
    try {
      const users = await fetchAllUsers();
      await getProjectsAndCavities(263);
      let currentUser = users.length > 0 ? users[0] : null;
      await getProjectsAndCavities(265);
      if (!currentUser || !currentUser.user_id) {
        logoff(); // No user, log off
        currentOutcomeStatus = "LOGGED_OFF";
        return currentOutcomeStatus; // Exit early
      }
      await getProjectsAndCavities(271);
      const isCurrentlyOnline = await NetInfo.fetch().then(
        (state) => state.isConnected ?? false
      );
      dispatch(setModalNetworkOff(!isCurrentlyOnline));
      await getProjectsAndCavities(274);
      if (
        isCurrentlyOnline &&
        currentUser.last_login_date &&
        currentUser.refresh_token &&
        currentUser.token
      ) {
        await getProjectsAndCavities(276);
        if (isTokenExpired(currentUser.last_login_date)) {
          await getProjectsAndCavities(278);
          try {
            await getProjectsAndCavities(280);
            const refreshed = await refreshUserToken(currentUser.refresh_token);
            await getProjectsAndCavities(282);
            await updateUser(String(currentUser.user_id)!, {
              token: refreshed.access,
              refresh_token: refreshed.refresh,
              last_login_date: new Date().toISOString(),
            });
            await getProjectsAndCavities(288);
            currentUser = {
              ...currentUser,
              token: refreshed.access,
              refresh_token: refreshed.refresh,
              last_login_date: new Date().toISOString(),
            }; // Update local currentUser
          } catch (refreshError) {
            console.error("Token refresh failed, logging off:", refreshError);
            logoff(); // Token refresh failed, log off
            currentOutcomeStatus = "LOGGED_OFF";
            return currentOutcomeStatus; // Exit early
          }
          await getProjectsAndCavities(296);
        } else if (isTokenAlmostExpired(currentUser.last_login_date)) {
          const daysLeft = getDaysUntilExpiration(currentUser.last_login_date);
          dispatch(setModalExpirationWarning({ show: true, days: daysLeft }));
        }
      }
      await getProjectsAndCavities(302);
      const localProjectsResult = await fetchAllProjects();
      await getProjectsAndCavities(304);
      const localProjectsExist = localProjectsResult.length > 0;
      dispatch(setModalHasProjects(localProjectsExist));
      await getProjectsAndCavities(307);
      const isCurrentlyOnlineAfterTokenCheck =
        store.getState().user.networkOff === false;
      await getProjectsAndCavities(309);
      // Only download projects AND cavities if no local projects exist AND online
      if (!localProjectsExist && isCurrentlyOnlineAfterTokenCheck) {
        await downloadProjects();
        await getProjectsAndCavities(313);
        // After downloadProjects, re-check localProjectsExist, as it might have changed
        const updatedLocalProjects = await fetchAllProjects();
        await getProjectsAndCavities(316);
        dispatch(setModalHasProjects(updatedLocalProjects.length > 0));
        await getProjectsAndCavities(318);
        dispatch(setModalUserHasNotProjects(updatedLocalProjects.length === 0));
        await getProjectsAndCavities(320);
      }

      dispatch(setModalChecked(true)); // Mark initial check as complete
      await getProjectsAndCavities(324);
      // Perform auto-upload if online and there are pending items
      if (
        isCurrentlyOnlineAfterTokenCheck &&
        autoUploadStatusRef.current === "idle"
      ) {
        const itemCount = await getProjectsWithPendingCavitiesCount(); // Check if there are any pending items to sync
        await getProjectsAndCavities(328);
        if (itemCount > 0) {
          performAutoUpload();
          await getProjectsAndCavities(331);
          currentOutcomeStatus = "AUTO_UPLOAD_INITIATED";
        }
      }
    } catch (error: any) {
      await getProjectsAndCavities(337);
      console.error("Error during initial check:", error);
      const msgToDisplay =
        typeof error.message === "string"
          ? error.message
          : JSON.stringify(error);
      dispatch(
        showError({
          title: "Erro de Sincronização Inicial",
          message: msgToDisplay,
        })
      );
      await getProjectsAndCavities(344);
      dispatch(setModalNetworkOff(true)); // Indicate an error that might require manual intervention or internet
      dispatch(setModalChecked(true));
      await getProjectsAndCavities(347); // Still mark as checked to allow user to proceed offline if possible
      currentOutcomeStatus = "ERROR_IN_CHECK";
    } finally {
      await getProjectsAndCavities(350);
      dispatch(setModalLoading(false));
      await getProjectsAndCavities(352);
    }
    await getProjectsAndCavities(354);
    // Determine if the modal can close silently after all checks
    if (
      currentOutcomeStatus !== ("LOGGED_OFF" as InitialCheckOutcome) &&
      currentOutcomeStatus !==
        ("AUTO_UPLOAD_INITIATED" as InitialCheckOutcome) &&
      autoUploadStatusRef.current !== "uploading"
    ) {
      await getProjectsAndCavities(357);
      const currentReduxUserState = store.getState().user;
      await getProjectsAndCavities(359);
      const canCloseSilently =
        (currentReduxUserState.networkOff === false &&
          (currentReduxUserState.hasProjects ||
            currentReduxUserState.userHasNotProjects)) || // Online and projects handled
        (currentReduxUserState.networkOff === true &&
          currentReduxUserState.hasProjects); // Offline but has local projects
      await getProjectsAndCavities(363);
      if (canCloseSilently && !currentReduxUserState.showExpirationWarning) {
        onClose();
        await getProjectsAndCavities(366);
        return "CLOSED_SILENTLY";
      }
      await getProjectsAndCavities(369);
    }

    return currentOutcomeStatus;
  }, [dispatch, logoff, downloadProjects, performAutoUpload, onClose]);

  useEffect(() => {
    if (visible) {
      requestLocationPermissions();
      // Only invoke initialCheck once per modal visibility session
      if (!initialCheckInvoked) {
        getProjectsAndCavities(381);
        setInitialCheckInvoked(true);
        getProjectsAndCavities(382);
        initialCheck();
      }
    } else {
      // Reset state when modal is closed
      setInitialCheckInvoked(false);
      setAutoUploadStatus("idle");
      setAutoUploadProgress(0);
      setAutoUploadError(null);
      setAutoUploadFailedCavities([]);
    }
  }, [visible, initialCheck, dispatch]); // Added dispatch to dependencies

  // Render logic for different auto-upload states
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
            <UploadProgressBar currentProgress={autoUploadProgress} />
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
              Erro na Sincronização Automática
            </TextInter>
            <Divider height={10} />
            <TextInter color={colors.dark[20]} style={styles.message}>
              {autoUploadError || "Falha no envio automático."}
            </TextInter>
            {autoUploadFailedCavities.length > 0 && (
              <View style={styles.failedCavitiesContainer}>
                <TextInter
                  color={colors.white[90]}
                  weight="bold"
                  style={styles.failedCavitiesHeader}
                >
                  Cavidades com Erro:
                </TextInter>
                <ScrollView
                  style={styles.failedCavitiesList}
                  nestedScrollEnabled
                >
                  {autoUploadFailedCavities.map((cav, index) => (
                    <View key={index} style={styles.failedCavityItem}>
                      <TextInter
                        color={colors.dark[20]}
                        fontSize={13}
                        style={styles.failedCavityText}
                      >
                        <TextInter color={colors.warning[100]} weight="bold">
                          {cav.nome_cavidade}
                        </TextInter>{" "}
                        (ID: {cav.registro_id}): {cav.error}
                      </TextInter>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
            <Divider />
            <LongButton title="Fechar" onPress={onClose} mode="cancel" />
          </View>
        </View>
      </Modal>
    );
  }

  // Main modal content based on Redux state
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!isLoading && !isLoginOff) onClose();
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {isLoading ? (
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
          ) : hasProjects &&
            checked &&
            !networkOff &&
            !showExpirationWarning ? (
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
                Seus projetos estão carregados.
              </TextInter>
              <Divider />
              <LongButton title="Ok" onPress={onClose} />
            </>
          ) : checked && !hasProjects && !networkOff && !userHasNotProjects ? (
            // This state should now primarily lead to downloadProjects, as userHasNotProjects handles the empty case
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
          ) : checked && networkOff ? (
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
            // Fallback for any unhandled intermediate state
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
        isOpen={showExpirationWarning && visible}
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
  failedCavitiesContainer: {
    marginTop: 15,
    width: "100%",
    maxHeight: 150,
    borderColor: colors.dark[40],
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  failedCavitiesHeader: {
    marginBottom: 5,
    textAlign: "left",
  },
  failedCavitiesList: {
    flexGrow: 0,
  },
  failedCavityItem: {
    backgroundColor: colors.dark[50],
    borderRadius: 5,
    padding: 8,
    marginBottom: 5,
  },
  failedCavityText: {
    textAlign: "left",
  },
});
