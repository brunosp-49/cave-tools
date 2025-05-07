import React, { FC, useState, useEffect, useCallback } from "react";
import { Modal, View, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchPendingCavityCount,
  fetchPendingProjectCount,
  syncPendingCavities,
  syncPendingProjects,
} from "../../../../db/controller";
import { colors } from "../../../../assets/colors";
import { Divider } from "../../../../components/divider";
import TextInter from "../../../../components/textInter";
import { LongButton } from "../../../../components/longButton";
import UploadProgressBar from "../../../../components/progressBar/uploadProgressBar";

type UploadStatus =
  | "idle"
  | "fetchingCounts"
  | "confirming"
  | "uploading"
  | "partial_success"
  | "success"
  | "error";

interface UploadDataModalProps {
  visible: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const UploadDataModal: FC<UploadDataModalProps> = ({
  visible,
  onClose, // Renamed for clarity: this closes the modal visually
  onUploadSuccess, // This signals the parent screen about the success
}) => {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [pendingCavityCount, setPendingCavityCount] = useState<number>(0);
  const [pendingProjectCount, setPendingProjectCount] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Keep track if the upload was successful to trigger callback on close
  const [uploadSessionSuccess, setUploadSessionSuccess] =
    useState<boolean>(false);

  const resetState = useCallback(() => {
    setStatus("idle");
    setPendingCavityCount(0);
    setPendingProjectCount(0);
    setProgress(0);
    setErrorMessage(null);
    setUploadSessionSuccess(false);
  }, []);

  useEffect(() => {
    if (visible) {
      const getCounts = async () => {
        setStatus("fetchingCounts");
        setUploadSessionSuccess(false); // Reset on open
        try {
          const cavCount = await fetchPendingCavityCount();
          const projCount = await fetchPendingProjectCount(); // <-- Fetch project count
          setPendingCavityCount(cavCount);
          setPendingProjectCount(projCount);

          if (cavCount === 0 && projCount === 0) {
            setStatus("success"); // Nothing to upload
            setUploadSessionSuccess(true);
          } else {
            setStatus("confirming");
          }
        } catch (err) {
          console.error("Failed to fetch pending counts:", err);
          setErrorMessage("Erro ao buscar registros pendentes.");
          setStatus("error");
        }
      };
      getCounts();
    } else {
      resetState(); // Reset state when modal becomes invisible
    }
  }, [visible, resetState]);

  const handleUploadConfirm = async () => {
    if (pendingCavityCount === 0 && pendingProjectCount === 0) return;

    setStatus("uploading");
    setProgress(1); // Show minimal progress
    setErrorMessage(null);
    setUploadSessionSuccess(false);

    let cavitiesSynced = false;
    let projectsSynced = false;
    let overallSuccess = true;
    let errors: string[] = [];

    // 1. Sync Cavities
    if (pendingCavityCount > 0) {
      console.log("Attempting to sync cavities...");
      const cavityResult = await syncPendingCavities();
      if (cavityResult.success) {
        cavitiesSynced = true;
        setProgress((prev) => prev + (pendingProjectCount > 0 ? 49 : 99)); // Distribute progress
      } else {
        overallSuccess = false;
        errors.push(cavityResult.error || "Falha ao enviar cavidades.");
        console.error("Cavity sync failed:", cavityResult.error);
      }
    } else {
      cavitiesSynced = true; // No cavities to sync, so considered "synced" for this step
    }

    // 2. Sync Projects (if cavities synced successfully or no cavities to sync)
    if (overallSuccess && pendingProjectCount > 0) {
      console.log("Attempting to sync projects...");
      const projectResult = await syncPendingProjects();
      if (projectResult.success) {
        projectsSynced = true;
        setProgress((prev) => prev + (pendingCavityCount > 0 ? 50 : 99)); // Distribute progress
      } else {
        overallSuccess = false;
        errors.push(projectResult.error || "Falha ao enviar projetos.");
        console.error("Project sync failed:", projectResult.error);
      }
    } else if (pendingProjectCount === 0) {
      projectsSynced = true; // No projects to sync
    }
    setProgress(100); // Ensure progress hits 100 if all stages passed or attempted

    if (overallSuccess) {
      setStatus("success");
      setUploadSessionSuccess(true);
    } else {
      setErrorMessage(errors.join(" \n"));
      // Determine if it's a total error or partial success
      if (
        (cavitiesSynced && !projectsSynced) ||
        (!cavitiesSynced && projectsSynced)
      ) {
        setStatus("partial_success"); // Or keep as "error" and let message explain
      } else {
        setStatus("error");
      }
      setProgress(0); // Reset progress on error
    }
  };

  const handleDismissModal = useCallback(() => {
    if (status === "uploading") return; // Prevent closing while uploading

    if (
      uploadSessionSuccess &&
      (pendingCavityCount > 0 || pendingProjectCount > 0)
    ) {
      // Call success callback only if there were items and they were successfully uploaded
      onUploadSuccess();
    }
    onClose();
  }, [
    status,
    uploadSessionSuccess,
    onClose,
    onUploadSuccess,
    pendingCavityCount,
    pendingProjectCount,
  ]);

  const renderContent = () => {
    if (status === "fetchingCounts" || status === "idle") {
      return (
        <>
          <ActivityIndicator size={70} color={colors.accent[100]} />
          <Divider height={16} />
          <TextInter color={colors.dark[20]} style={styles.message}>
            Verificando dados pendentes...
          </TextInter>
        </>
      );
    }

    switch (status) {
      case "confirming":
        const totalItems = pendingCavityCount + pendingProjectCount;
        let confirmMessage = `Você possui um total de ${totalItems} ${
          totalItems === 1 ? "item pendente" : "itens pendentes"
        }:`;
        if (pendingCavityCount > 0) {
          confirmMessage += `\n- ${pendingCavityCount} ${
            pendingCavityCount === 1 ? "cavidade" : "cavidades"
          }`;
        }
        if (pendingProjectCount > 0) {
          confirmMessage += `\n- ${pendingProjectCount} ${
            pendingProjectCount === 1 ? "projeto" : "projetos"
          }`;
        }
        confirmMessage += "\nDeseja iniciar o envio agora?";

        return (
          <>
            <Ionicons
              name="cloud-upload-outline"
              size={70}
              color={colors.accent[100]}
            />
            <Divider height={16} />
            <TextInter
              color={colors.white[90]}
              fontSize={20}
              style={styles.title}
            >
              Enviar Dados Pendentes
            </TextInter>
            <Divider height={10} />
            <TextInter color={colors.dark[20]} style={styles.message}>
              {confirmMessage}
            </TextInter>
            <Divider />
            <LongButton title="Enviar Agora" onPress={handleUploadConfirm} />
            <Divider height={16} />
            <LongButton
              title="Cancelar"
              onPress={handleDismissModal}
              mode="cancel"
            />
          </>
        );

      case "uploading":
        return (
          <>
            <Ionicons
              name="cloud-upload-outline"
              size={70}
              color={colors.accent[100]}
            />
            <Divider height={16} />
            <TextInter
              color={colors.white[90]}
              fontSize={20}
              style={styles.title}
            >
              Enviando Dados...
            </TextInter>
            <Divider height={10} />
            <UploadProgressBar currentProgress={progress} />
            <TextInter color={colors.dark[20]} style={styles.message}>
              Por favor, aguarde. Não feche o aplicativo.
            </TextInter>
          </>
        );

      case "success":
        const initialTotalItems = pendingCavityCount + pendingProjectCount; // Use counts when modal opened
        return (
          <>
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
              {initialTotalItems === 0
                ? "Nenhum Dado Pendente"
                : "Envio Concluído"}
            </TextInter>
            <Divider height={10} />
            <TextInter color={colors.dark[20]} style={styles.message}>
              {initialTotalItems === 0
                ? "Todos os seus dados já estão sincronizados."
                : "Todos os dados pendentes foram enviados com sucesso."}
            </TextInter>
            <Divider />
            <LongButton title="Ok" onPress={handleDismissModal} />
          </>
        );

      case "error":
      case "partial_success": // Handle partial success similar to error, but message might differ
        let errorTitle = "Erro no Envio";
        if (status === "partial_success") {
          errorTitle = "Envio Parcialmente Concluído";
        }
        return (
          <>
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
              {errorTitle}
            </TextInter>
            <Divider height={10} />
            <TextInter color={colors.dark[20]} style={styles.message}>
              {errorMessage || "Ocorreu um erro inesperado."}
            </TextInter>
            <Divider />
            {(pendingCavityCount > 0 || pendingProjectCount > 0) &&
              status !== "partial_success" && ( // Allow retry only if there were items and it wasn't a partial success shown as info
                <LongButton
                  title="Tentar Novamente"
                  onPress={handleUploadConfirm}
                />
              )}
            {(pendingCavityCount > 0 || pendingProjectCount > 0) &&
              status === "partial_success" && ( // If partial, maybe just an OK button or a more specific retry
                <TextInter color={colors.dark[20]} style={styles.message}>
                  Verifique os detalhes e tente os itens restantes mais tarde,
                  se necessário.
                </TextInter>
              )}
            <Divider height={8} />
            <LongButton
              title="Fechar"
              onPress={handleDismissModal}
              mode="cancel"
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleDismissModal}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>{renderContent()}</View>
      </View>
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
    backgroundColor: colors.dark[30], // Match your CheckProjectsModal style
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
