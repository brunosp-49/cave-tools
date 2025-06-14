import { Modal, View, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
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
  createCavitiesFromServer, // Import the new function
  FailedCavity,
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
  const [autoUploadFailedCavities, setAutoUploadFailedCavities] = useState<FailedCavity[]>([]);
  const [autoUploadProgress, setAutoUploadProgress] = useState(0);
  const autoUploadStatusRef = useRef(autoUploadStatus);

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
      const users = await fetchAllUsers();
      if (users.length > 0 && users[0].user_id) {
        await deleteUser(String(users[0].user_id));
      }
      dispatch(resetModalState());
      dispatch(resetLoadingState());
      navigation.navigate("Login");
      onClose();
    } catch (error) {
      console.error("Error during logoff:", error);
      dispatch(resetModalState());
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
        dispatch(setModalNetworkOff(true));
        throw new Error("User or token not available for project download.");
      }
      const user = users[0];

      // 1. Download Projects
      const projectsResponse = await api.get("/projetos/usuario/", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const projectsFromServer = projectsResponse.data.results;

      if (!projectsFromServer || !Array.isArray(projectsFromServer)) {
        throw new Error("Invalid project data format from server.");
      }

      if (projectsFromServer.length === 0) {
        dispatch(setModalUserHasNotProjects(true));
      } else {
        const projectsToCreate = projectsFromServer.map((project: any) => ({
          id: String(project.id),
          fk_cliente: String(project.cliente.id),
          nome_projeto: project.nome_projeto,
          inicio: project.inicio,
          descricao_projeto: project.descricao_projeto,
          responsavel: project.cliente.nome,
          status: 'Ativo', // Assuming default status
        }));
        await createProjects(projectsToCreate); // This function now handles create/update
        dispatch(setModalHasProjects(true));

        // 2. Download Cavities associated with these projects
        const cavitiesResponse = await api.get("/cavidades/cavidades-usuario", { // NEW API CALL
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const cavitiesFromServer = cavitiesResponse.data.results;

        if (!cavitiesFromServer || !Array.isArray(cavitiesFromServer)) {
            console.warn("No cavities or invalid cavities data format from server.");
        } else {
            await createCavitiesFromServer(cavitiesFromServer); // NEW FUNCTION CALL
            console.log(`Downloaded and saved ${cavitiesFromServer.length} cavities.`);
        }
      }
      dispatch(setModalChecked(true));
    } catch (error: any) {
      console.error("Error downloading projects/cavities:", error);
      if (error.response && error.response.status === 401) {
        logoff();
      } else {
        dispatch(setModalNetworkOff(true));
      }
      dispatch(setModalChecked(true));
    } finally {
      dispatch(setModalLoading(false));
    }
  }, [dispatch, testConnection, logoff]);

  const performAutoUpload = useCallback(
    async (): Promise<boolean> => {
      setAutoUploadStatus("uploading");
      setAutoUploadError(null);
      setAutoUploadFailedCavities([]);
      setAutoUploadProgress(1);
      let overallSuccess = true;

      try {
        const projectsToSync = await fetchProjectsWithPendingCavities();
        if (projectsToSync.length > 0) {
          const result = await syncConsolidatedUpload(projectsToSync, (progress) => {
            setAutoUploadProgress(progress);
          });
          if (!result.success) {
            overallSuccess = false;
            setAutoUploadError(result.error || "Falha no envio automático.");
            setAutoUploadFailedCavities(result.failedCavities || []);
          }
        } else {
           setAutoUploadProgress(100);
        }
      } catch (error: any) {
        overallSuccess = false;
        const msgToDisplay = typeof error.message === 'string' ? error.message : JSON.stringify(error);
        setAutoUploadError(`Erro ao preparar dados para envio automático: ${msgToDisplay}`);
        console.error("Error in performAutoUpload preparation:", error);
      }

      if (overallSuccess) {
        setAutoUploadStatus("success");
        setTimeout(() => {
          if (visible && autoUploadStatusRef.current === "success") {
            onClose();
          }
        }, 1500);
        return true;
      } else {
        setAutoUploadStatus("error");
        return false;
      }
    },
    [onClose, visible]
  );

  const initialCheck = useCallback(async (): Promise<InitialCheckOutcome> => {
    let currentOutcomeStatus: InitialCheckOutcome = "STAY_OPEN";
    dispatch(setModalLoading(true));

    try {
      const users = await fetchAllUsers();
      let currentUser = users.length > 0 ? users[0] : null;

      if (!currentUser || !currentUser.user_id) {
        logoff();
        currentOutcomeStatus = "LOGGED_OFF";
      }

      if (currentOutcomeStatus !== "LOGGED_OFF") {
        const isCurrentlyOnline = await NetInfo.fetch().then(state => state.isConnected ?? false);
        dispatch(setModalNetworkOff(!isCurrentlyOnline));

        if (isCurrentlyOnline && currentUser && currentUser.last_login_date && currentUser.refresh_token && currentUser.token) {
          if (isTokenExpired(currentUser.last_login_date)) {
            try {
              const refreshed = await refreshUserToken(currentUser.refresh_token);
              await updateUser(String(currentUser.user_id)!, {
                token: refreshed.access,
                refresh_token: refreshed.refresh,
                last_login_date: new Date().toISOString(),
              });
            } catch (refreshError) {
              console.error("Token refresh failed, logging off:", refreshError);
              currentOutcomeStatus = "ERROR_IN_CHECK";
            }
          } else if (isTokenAlmostExpired(currentUser.last_login_date)) {
            const daysLeft = getDaysUntilExpiration(currentUser.last_login_date);
            dispatch(setModalExpirationWarning({ show: true, days: daysLeft }));
          }
        }
      }

      if (currentOutcomeStatus !== "LOGGED_OFF") {
        const localProjectsResult = await fetchAllProjects();
        const localProjectsExist = localProjectsResult.length > 0;
        dispatch(setModalHasProjects(localProjectsExist));

        const isCurrentlyOnlineAfterTokenCheck = store.getState().user.networkOff === false;
        // Only download projects AND cavities if no local projects exist AND online
        if (!localProjectsExist && isCurrentlyOnlineAfterTokenCheck) {
            await downloadProjects();
        }
        dispatch(setModalChecked(true));
      }

    } catch (error: any) {
      console.error("Error during initial check:", error);
      const msgToDisplay = typeof error.message === 'string' ? error.message : JSON.stringify(error);
      dispatch(showError({
        title: "Erro de Sincronização Inicial",
        message: msgToDisplay
      }));
      dispatch(setModalNetworkOff(true));
      dispatch(setModalChecked(true));
      currentOutcomeStatus = "ERROR_IN_CHECK";
    } finally {
      dispatch(setModalLoading(false));
    }

    if (currentOutcomeStatus === "LOGGED_OFF") {
      return "LOGGED_OFF";
    }

    const isCurrentlyOnlineForPostCheck = store.getState().user.networkOff === false;
    if (isCurrentlyOnlineForPostCheck && autoUploadStatusRef.current === "idle" && currentOutcomeStatus !== "ERROR_IN_CHECK") {
      const itemCount = await getProjectsWithPendingCavitiesCount();
      if (itemCount > 0) {
        performAutoUpload();
        currentOutcomeStatus = "AUTO_UPLOAD_INITIATED";
      }
    }

    if (currentOutcomeStatus !== "AUTO_UPLOAD_INITIATED" || autoUploadStatusRef.current !== 'uploading') {
        if (currentOutcomeStatus !== "ERROR_IN_CHECK") {
            const currentReduxUserState = store.getState().user;
            const canCloseSilently =
                (isCurrentlyOnlineForPostCheck && (currentReduxUserState.hasProjects || currentReduxUserState.userHasNotProjects)) ||
                (!isCurrentlyOnlineForPostCheck && currentReduxUserState.hasProjects);

            if (canCloseSilently && !currentReduxUserState.showExpirationWarning) {
                onClose();
                return "CLOSED_SILENTLY";
            }
        }
    }

    return currentOutcomeStatus;
  }, [dispatch, logoff, downloadProjects, performAutoUpload, onClose]);

  useEffect(() => {
    if (visible) {
      requestLocationPermissions();
      if (!initialCheckInvoked) {
        setInitialCheckInvoked(true);
        initialCheck().then((outcomeFromCheck) => {
        });
      }
    } else {
      setInitialCheckInvoked(false);
      setAutoUploadStatus("idle");
      setAutoUploadProgress(0);
      setAutoUploadError(null);
      setAutoUploadFailedCavities([]);
    }
  }, [visible, initialCheck, dispatch]);

  if (autoUploadStatus === "uploading") {
    return (
      <Modal visible={true} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <TextInter color={colors.white[90]} fontSize={23} style={styles.title}>
              Sincronizando Dados
            </TextInter>
            <Divider height={16} />
            <UploadProgressBar currentProgress={autoUploadProgress} />
            <Divider height={16} />
            <TextInter color={colors.dark[20]} weight="regular" style={styles.message}>
              Enviando dados pendentes... Por favor, aguarde.
            </TextInter>
          </View>
        </View>
      </Modal>
    );
  }
  if (autoUploadStatus === "success") {
    return (
      <Modal visible={true} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Ionicons name="checkmark-circle-outline" size={70} color={colors.accent[100]} />
            <Divider height={16} />
            <TextInter color={colors.white[90]} fontSize={20} style={styles.title}>
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
      <Modal visible={true} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <Ionicons name="alert-circle-outline" size={70} color={colors.error[100]} />
            <Divider height={16} />
            <TextInter color={colors.white[90]} fontSize={20} style={styles.title}>
              Erro na Sincronização Automática
            </TextInter>
            <Divider height={10} />
            <TextInter color={colors.dark[20]} style={styles.message}>
              {autoUploadError || "Falha no envio automático."}
            </TextInter>
            {autoUploadFailedCavities.length > 0 && (
                <View style={styles.failedCavitiesContainer}>
                    <TextInter color={colors.white[90]} weight="bold" style={styles.failedCavitiesHeader}>
                        Cavidades com Erro:
                    </TextInter>
                    <ScrollView style={styles.failedCavitiesList} nestedScrollEnabled>
                        {autoUploadFailedCavities.map((cav, index) => (
                            <View key={index} style={styles.failedCavityItem}>
                                <TextInter color={colors.dark[20]} fontSize={13} style={styles.failedCavityText}>
                                    <TextInter color={colors.warning[100]} weight="bold">{cav.nome_cavidade}</TextInter> (ID: {cav.registro_id}): {cav.error}
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
              <TextInter color={colors.white[90]} fontSize={23} style={styles.title}>
                {checked ? "Verificação Concluída" : "Verificando dados..."}
              </TextInter>
              <Divider height={16} />
              {checked ? <JumpingIcon /> : <ActivityIndicator size={70} color={colors.accent[100]} />}
              <Divider height={16} />
              {checked && <ProgressBar finished={downloadCompleted && !isLoading} />}
              <TextInter color={colors.dark[20]} weight="regular" style={styles.message}>
                {checked ? "Aguarde..." : "Aguarde alguns segundos"}
              </TextInter>
            </>
          ) : userHasNotProjects ? (
            <>
              <TextInter color={colors.white[90]} fontSize={23} style={styles.title}>
                Nenhum projeto encontrado
              </TextInter>
              <Divider height={16} />
              <Ionicons name="sad-outline" color={colors.accent[100]} size={70} />
              <Divider height={16} />
              <TextInter color={colors.dark[20]} weight="regular" style={styles.message}>
                Não há projetos vinculados ao seu usuário.
              </TextInter>
              <Divider />
              <LongButton title="Sair" onPress={logoff} isLoading={isLoginOff} />
            </>
          ) : hasProjects && checked && !networkOff && !showExpirationWarning ? (
            showExpirationWarning ? (
                <>
                    <TextInter color={colors.white[90]} fontSize={23} style={styles.title}>Atenção!</TextInter>
                    <Divider height={16} /><Ionicons name="warning-outline" color={colors.warning[100]} size={70} /><Divider height={16} />
                    <TextInter color={colors.dark[20]} weight="regular" style={styles.message}>
                        Sua sessão expira em {daysToExpire} {daysToExpire === 1 ? "dia" : "dias"}. Sincronize seus dados.
                    </TextInter>
                    <Divider />
                    <LongButton title="Ok, Entendi" onPress={onClose} />
                </>
            ) : (
                <>
                    <TextInter color={colors.white[90]} fontSize={23} style={styles.title}>Projetos Disponíveis</TextInter>
                    <Divider height={16} /><Ionicons name="checkmark-circle-outline" color={colors.accent[100]} size={70} /><Divider height={16} />
                    <TextInter color={colors.dark[20]} weight="regular" style={styles.message}>Seus projetos estão carregados.</TextInter>
                    <Divider /><LongButton title="Ok" onPress={onClose} />
                </>
            )

          ) : checked && !hasProjects && !networkOff && !userHasNotProjects ? (
            <>
              <TextInter color={colors.white[90]} fontSize={23} style={styles.title}>
                Projetos não encontrados localmente
              </TextInter>
              <Divider height={16} /><Ionicons name="cloud-download-outline" color={colors.dark[60]} size={70} /><Divider height={16} />
              <TextInter color={colors.dark[20]} weight="regular" style={styles.message}>
                Deseja baixar os projetos vinculados ao seu usuário?
              </TextInter>
              <Divider />
              <LongButton disabled={isLoginOff || isLoading} isLoading={isLoading} title="Baixar Projetos" onPress={downloadProjects} />
              <Divider height={8} />
              <LongButton disabled={isLoginOff || isLoading} isLoading={isLoginOff} title="Sair" onPress={logoff} />
            </>
          ) : checked && networkOff ? (
            <>
              <TextInter color={colors.white[90]} fontSize={23} style={styles.title}>
                Você está sem internet
              </TextInter>
              <Divider height={16} /><Ionicons name="cloud-offline-outline" color={colors.dark[60]} size={70} /><Divider height={16} />
              <TextInter color={colors.dark[20]} weight="regular" style={styles.message}>
                {hasProjects
                  ? "Trabalhando offline. Dados pendentes não puderam ser enviados."
                  : "Conecte-se para baixar projetos e enviar dados."}
              </TextInter>
              <Divider />
              <LongButton title={hasProjects ? "Continuar Offline" : "Sair"} onPress={hasProjects ? onClose : logoff} isLoading={isLoginOff} />
            </>
          ) : (
            <>
              <TextInter color={colors.white[90]} fontSize={18} style={styles.title}>
                Carregando Informações...
              </TextInter>
              <ActivityIndicator size="large" color={colors.accent[100]} />
            </>
          )}
        </View>
      </View>

      <DefaultModal
        isOpen={showExpirationWarning && visible}
        onClose={() => dispatch(setModalExpirationWarning({ show: false, days: 0 }))}
        title={`Atenção! Sua sessão expira em ${daysToExpire} ${daysToExpire === 1 ? "dia" : "dias"}`}
        message="Recomendamos sincronizar seus dados. Se a sessão expirar, precisará fazer login novamente."
        titleButtonConfirm="Entendi"
        onConfirm={() => dispatch(setModalExpirationWarning({ show: false, days: 0 }))}
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
    width: '100%',
    maxHeight: 150,
    borderColor: colors.dark[40],
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  failedCavitiesHeader: {
    marginBottom: 5,
    textAlign: 'left',
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
    textAlign: 'left',
  },
});