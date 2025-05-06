import React, { FC, useState, useEffect, useCallback } from "react";
import { Modal, View, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchPendingCavityCount,
  syncPendingCavities,
} from "../../../db/controller";
import { colors } from "../../../assets/colors";
import { Divider } from "../../divider";
import TextInter from "../../textInter";
import { LongButton } from "../../longButton";
import UploadProgressBar from "../../progressBar/uploadProgressBar";

type UploadStatus = "idle" | "confirming" | "uploading" | "success" | "error";

interface UploadCavitiesModalProps {
  visible: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const UploadCavitiesModal: FC<UploadCavitiesModalProps> = ({
  visible,
  onClose, // Renamed for clarity: this closes the modal visually
  onUploadSuccess, // This signals the parent screen about the success
}) => {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [initialPendingCount, setInitialPendingCount] = useState<number>(0); // Store initial count for messages
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFetchingCount, setIsFetchingCount] = useState<boolean>(false);
  // Keep track if the upload was successful to trigger callback on close
  const [uploadWasSuccessful, setUploadWasSuccessful] =
    useState<boolean>(false);

  const resetState = useCallback(() => {
    setStatus("idle");
    setInitialPendingCount(0);
    setProgress(0);
    setErrorMessage(null);
    setIsFetchingCount(false);
    setUploadWasSuccessful(false); // Reset success flag
  }, []);

  useEffect(() => {
    if (visible) {
      const getCount = async () => {
        setIsFetchingCount(true);
        setStatus("idle");
        setUploadWasSuccessful(false); // Reset on open
        try {
          const count = await fetchPendingCavityCount();
          setInitialPendingCount(count); // Store the count fetched initially
          setStatus(count > 0 ? "confirming" : "success"); // Go to confirm or directly to success if 0
          if (count === 0) {
            setUploadWasSuccessful(true); // Consider 0 pending as a "successful" state initially
          }
        } catch (err) {
          console.error("Failed to fetch pending count:", err);
          setErrorMessage("Erro ao buscar registros pendentes.");
          setStatus("error");
        } finally {
          setIsFetchingCount(false);
        }
      };
      getCount();
    } else {
      // Reset state when modal becomes invisible
      resetState();
    }
  }, [visible, resetState]);

  const handleUploadConfirm = async () => {
    if (initialPendingCount === 0) return; // Should not happen if status is 'confirming'

    setStatus("uploading");
    setProgress(1); // Show minimal progress
    setErrorMessage(null);
    setUploadWasSuccessful(false); // Reset success flag before attempting upload

    // Simulate some progress
    setProgress(10);

    try {
      const result = await syncPendingCavities();

      if (result.success) {
        setProgress(100);
        setStatus("success");
        setUploadWasSuccessful(true); // Set flag on success
        // Don't call onUploadSuccess here - wait for user dismissal
      } else {
        throw new Error(result.error || "Falha desconhecida no envio.");
      }
    } catch (err: any) {
      console.error("Error syncing cavities:", err);
      setErrorMessage(
        err.message || "Ocorreu um erro durante o envio dos dados."
      );
      setStatus("error");
      setProgress(0); // Reset progress on error
    }
  };

  // This function now handles the visual closing AND triggering the success callback if needed
  const handleDismissModal = useCallback(() => {
    if (status === "uploading") {
      // Prevent closing while uploading
      return;
    }

    // If the upload was successful, call the success callback *before* closing
    if (uploadWasSuccessful) {
      onUploadSuccess();
    }

    // Call the parent's onClose function to hide the modal
    onClose();
  }, [status, uploadWasSuccessful, onClose, onUploadSuccess]);

  const renderContent = () => {
    if (isFetchingCount || status === "idle") {
      return (
        <>
          <ActivityIndicator size={70} color={colors.accent[100]} />
          <Divider height={16} />
          <TextInter color={colors.dark[20]} style={styles.message}>
            Verificando registros pendentes...
          </TextInter>
        </>
      );
    }

    switch (status) {
      case "confirming":
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
              Você possui{" "}
              <TextInter weight="bold" color={colors.accent[100]}>
                {initialPendingCount}
              </TextInter>{" "}
              {initialPendingCount === 1
                ? "registro pendente"
                : "registros pendentes"}{" "}
              para enviar. Deseja iniciar o envio agora?
            </TextInter>
            <Divider />
            <LongButton title="Enviar Agora" onPress={handleUploadConfirm} />
            <Divider height={16} />
            {/* Cancel button now calls handleDismissModal */}
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
            {/* No buttons while uploading */}
          </>
        );

      case "success":
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
              {/* Use initial count for message consistency */}
              {initialPendingCount === 0
                ? "Nenhum Registro Pendente"
                : "Envio Concluído"}
            </TextInter>
            <Divider height={10} />
            <TextInter color={colors.dark[20]} style={styles.message}>
              {initialPendingCount === 0
                ? "Todos os seus registros já estão sincronizados."
                : "Todos os registros pendentes foram enviados com sucesso."}
            </TextInter>
            <Divider />
            {/* OK button now calls handleDismissModal */}
            <LongButton title="Ok" onPress={handleDismissModal} />
          </>
        );

      case "error":
        return (
          <>
            <Ionicons
              name="alert-circle-outline"
              size={70}
              color={colors.error[100]} // Use an error color
            />
            <Divider height={16} />
            <TextInter
              color={colors.white[90]}
              fontSize={20}
              style={styles.title}
            >
              Erro no Envio
            </TextInter>
            <Divider height={10} />
            <TextInter color={colors.dark[20]} style={styles.message}>
              {errorMessage || "Ocorreu um erro inesperado."}
            </TextInter>
            <Divider />
            {/* Allow retry only if there were items initially */}
            {initialPendingCount > 0 && (
              <LongButton
                title="Tentar Novamente"
                onPress={handleUploadConfirm}
              />
            )}
            <Divider height={8} />
            {/* Close button now calls handleDismissModal */}
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
      onRequestClose={handleDismissModal} // Handle back button on Android
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
