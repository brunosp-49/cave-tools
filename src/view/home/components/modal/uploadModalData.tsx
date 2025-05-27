import React, { FC, useState, useEffect, useCallback, useRef } from "react";
import { Modal, View, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  // Placeholder para as novas funções do controller
  getProjectsWithPendingCavitiesCount, // Nova função para contar projetos com cavidades pendentes
  fetchProjectsWithPendingCavities,    // Nova função para buscar os dados consolidados
  syncConsolidatedUpload,              // Nova função para sincronizar os dados consolidados
} from "../../../../db/controller"; // Ajuste o caminho se necessário
import { colors } from "../../../../assets/colors";
import { Divider } from "../../../../components/divider";
import TextInter from "../../../../components/textInter";
import { LongButton } from "../../../../components/longButton";
import UploadProgressBar from "../../../../components/progressBar/uploadProgressBar";
import { Cavidade, ProjectModel } from "../../../../types"; // Importar Cavidade e ProjectModel

// Nova interface para a estrutura de dados consolidada
export interface ProjectWithPendingCavities extends ProjectModel { // Estende seu ProjectModel
  cavities_payload: Cavidade[]; // Array de cavidades pendentes para este projeto
}

type UploadStatus =
  | "idle"
  | "fetchingCounts"
  | "confirming"
  | "uploading"
  | "success"
  | "error";

interface UploadDataModalProps {
  visible: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const UploadDataModal: FC<UploadDataModalProps> = ({
  visible,
  onClose,
  onUploadSuccess,
}) => {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [pendingItemCount, setPendingItemCount] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadSessionSuccess, setUploadSessionSuccess] = useState<boolean>(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const resetState = useCallback(() => {
    if (isMounted.current) {
      setStatus("idle");
      setPendingItemCount(0);
      setProgress(0);
      setErrorMessage(null);
      setUploadSessionSuccess(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      const getCounts = async () => {
        if (!isMounted.current) return;
        setStatus("fetchingCounts");
        setUploadSessionSuccess(false);
        try {
          const itemCount = await getProjectsWithPendingCavitiesCount(); 
          if (!isMounted.current) return;
          setPendingItemCount(itemCount);

          if (itemCount === 0) {
            setStatus("success"); 
            setUploadSessionSuccess(true);
          } else {
            setStatus("confirming");
          }
        } catch (err) {
          console.error("Failed to fetch pending item counts:", err);
          if (isMounted.current) {
            setErrorMessage("Erro ao buscar registros pendentes para envio.");
            setStatus("error");
          }
        }
      };
      getCounts();
    } else {
      resetState(); 
    }
  }, [visible, resetState]);

  const handleUploadConfirm = async () => {
    if (pendingItemCount === 0) return;

    setStatus("uploading");
    setProgress(1); 
    setErrorMessage(null);
    setUploadSessionSuccess(false);

    try {
      const projectsToSync = await fetchProjectsWithPendingCavities();
      if (!isMounted.current) return;

      if (projectsToSync.length === 0) {
        setStatus("success");
        setUploadSessionSuccess(true);
        setProgress(100);
        return;
      }

      const result = await syncConsolidatedUpload(projectsToSync, (p) => {
          if(isMounted.current) setProgress(p);
      });
      
      if (!isMounted.current) return;

      if (result.success) {
        setStatus("success");
        setUploadSessionSuccess(true);
      } else {
        setErrorMessage(result.error || "Falha ao enviar alguns dados.");
        setStatus("error");
      }
    } catch (err: any) {
      console.error("Upload process failed:", err);
      if (isMounted.current) {
        setErrorMessage(err.message || "Ocorreu um erro durante o envio.");
        setStatus("error");
      }
    } finally {
        if(isMounted.current && status !== 'success') setProgress(0);
        else if (isMounted.current && status === 'success') setProgress(100);
    }
  };

  const handleDismissModal = useCallback(() => {
    if (status === "uploading") return; 

    if (uploadSessionSuccess && pendingItemCount > 0) {
      onUploadSuccess();
    }
    onClose();
  }, [status, uploadSessionSuccess, onClose, onUploadSuccess, pendingItemCount]);

  const renderContent = () => {
    if (status === "fetchingCounts" || status === "idle" && visible) {
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
        return (
          <>
            <Ionicons name="cloud-upload-outline" size={70} color={colors.accent[100]} />
            <Divider height={16} />
            <TextInter color={colors.white[90]} fontSize={20} style={styles.title}>
              Enviar Dados Pendentes
            </TextInter>
            <Divider height={10} />
            <TextInter color={colors.dark[20]} style={styles.message}>
              {`Você possui ${pendingItemCount} ${pendingItemCount === 1 ? "projeto com cavidades pendentes" : "projetos com cavidades pendentes"} para envio. Deseja iniciar agora?`}
            </TextInter>
            <Divider />
            <LongButton title="Enviar Agora" onPress={handleUploadConfirm} />
            <Divider height={16} />
            <LongButton title="Cancelar" onPress={handleDismissModal} mode="cancel" />
          </>
        );

      case "uploading":
        return (
          <>
            <Ionicons name="cloud-upload-outline" size={70} color={colors.accent[100]} />
            <Divider height={16} />
            <TextInter color={colors.white[90]} fontSize={20} style={styles.title}>
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
        return (
          <>
            <Ionicons name="checkmark-circle-outline" size={70} color={colors.accent[100]} />
            <Divider height={16} />
            <TextInter color={colors.white[90]} fontSize={20} style={styles.title}>
              {pendingItemCount === 0 && !uploadSessionSuccess
                ? "Nenhum Dado Pendente"
                : "Envio Concluído"}
            </TextInter>
            <Divider height={10} />
            <TextInter color={colors.dark[20]} style={styles.message}>
              {pendingItemCount === 0 && !uploadSessionSuccess
                ? "Todos os seus dados já estão sincronizados."
                : "Todos os dados pendentes foram enviados com sucesso."}
            </TextInter>
            <Divider />
            <LongButton title="Ok" onPress={handleDismissModal} />
          </>
        );

      case "error":
        return (
          <>
            <Ionicons name="alert-circle-outline" size={70} color={colors.error[100]} />
            <Divider height={16} />
            <TextInter color={colors.white[90]} fontSize={20} style={styles.title}>
              Erro no Envio
            </TextInter>
            <Divider height={10} />
            <TextInter color={colors.dark[20]} style={styles.message}>
              {errorMessage || "Ocorreu um erro inesperado."}
            </TextInter>
            <Divider />
            {pendingItemCount > 0 && (
                 <LongButton title="Tentar Novamente" onPress={handleUploadConfirm} />
            )}
            <Divider height={8} />
            <LongButton title="Fechar" onPress={handleDismissModal} mode="cancel" />
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
