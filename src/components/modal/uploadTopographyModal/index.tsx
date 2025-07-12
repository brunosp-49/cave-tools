import React, { FC, useState, useEffect, useCallback, useRef } from "react";
import {
  Modal,
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  fetchPendingTopographyCount,
  syncTopographyDrawings,
  createTopographiesFromServer,
  fetchAllUsers,
} from "../../../db/controller";
import { colors } from "../../../assets/colors";
import { Divider } from "../../../components/divider";
import TextInter from "../../../components/textInter";
import { LongButton } from "../../../components/longButton";
import UploadProgressBar from "../../../components/progressBar/uploadProgressBar";
import { api } from "../../../api";

type UploadStatus =
  | "idle"
  | "fetchingCounts"
  | "confirming"
  | "uploading"
  | "downloading"
  | "success"
  | "error";

interface UploadTopographyModalProps {
  visible: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export const UploadTopographyModal: FC<UploadTopographyModalProps> = ({
  visible,
  onClose,
  onUploadSuccess,
}) => {
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      setPendingCount(0);
      setProgress(0);
      setErrorMessage(null);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      const getCount = async () => {
        if (!isMounted.current) return;
        setStatus("fetchingCounts");
        try {
          const count = await fetchPendingTopographyCount();
          if (!isMounted.current) return;
          setPendingCount(count);

          if (count === 0) {
            setStatus("success");
          } else {
            setStatus("confirming");
          }
        } catch (err) {
          console.error("Failed to fetch pending topography counts:", err);
          if (isMounted.current) {
            setErrorMessage("Erro ao buscar registros pendentes para envio.");
            setStatus("error");
          }
        }
      };
      getCount();
    } else {
      resetState();
    }
  }, [visible, resetState]);

  const handleUploadConfirm = async () => {
    setStatus("uploading");
    setProgress(1);

    const uploadResult = await syncTopographyDrawings((p) => {
      if (isMounted.current) setProgress(p);
    });

    if (!uploadResult.success) {
      if (isMounted.current) {
        setErrorMessage(
          uploadResult.error || "Falha ao enviar algumas topografias."
        );
        setStatus("error");
      }
      return;
    }

    setStatus("downloading");
    try {
      const users = await fetchAllUsers();
      if (!users.length)
        throw new Error("Usuário não autenticado para o download.");

      const response = await api.get("/medicoes-topograficas/", {
        // Endpoint de exemplo
        headers: { Authorization: `Bearer ${users[0].token}` },
      });

      if (response.data && response.data.results) {
        await createTopographiesFromServer(response.data.results);
      }

      if (isMounted.current) setStatus("success");
    } catch (error) {
      console.error("Falha ao baixar novas topografias:", error);
      if (isMounted.current) {
        // Mesmo que o download falhe, o upload foi um sucesso.
        setStatus("success");
      }
    }
  };

  const handleDismissModal = useCallback(() => {
    if (status === "success" && pendingCount > 0) {
      onUploadSuccess();
    }
    onClose();
  }, [status, onClose, onUploadSuccess, pendingCount]);

  const renderContent = () => {
    if (status === "fetchingCounts" || (status === "idle" && visible)) {
      return (
        <>
          <ActivityIndicator size={70} color={colors.accent[100]} />
          <Divider height={16} />
          <TextInter color={colors.dark[20]} style={styles.message}>
            Verificando topografias pendentes...
          </TextInter>
        </>
      );
    }

    switch (status) {
      case "confirming":
        return (
          <>
            <Ionicons name="map-outline" size={70} color={colors.accent[100]} />
            <Divider height={16} />
            <TextInter
              color={colors.white[90]}
              fontSize={20}
              style={styles.title}
            >
              {pendingCount}{" "}
              {pendingCount === 1
                ? "Topografia Pendente"
                : "Topografias Pendentes"}
            </TextInter>
            <Divider height={10} />
            <TextInter color={colors.dark[20]} style={styles.message}>
              Deseja enviar agora os dados para a nuvem?
            </TextInter>
            <Divider />
            <LongButton title="Enviar Agora" onPress={handleUploadConfirm} />
            <Divider height={16} />
            <LongButton title="Depois" onPress={onClose} mode="cancel" />
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
              fontSize={23}
              style={styles.title}
            >
              Enviando Topografias...
            </TextInter>
            <Divider height={10} />
            <UploadProgressBar currentProgress={progress} />
            <TextInter color={colors.dark[20]} style={styles.message}>
              Por favor, aguarde.
            </TextInter>
          </>
        );

      case "downloading":
        return (
          <>
            <ActivityIndicator size={70} color={colors.accent[100]} />
            <Divider height={16} />
            <TextInter
              color={colors.white[90]}
              fontSize={23}
              style={styles.title}
            >
              Atualizando Dados...
            </TextInter>
            <Divider height={10} />
            <TextInter color={colors.dark[20]} style={styles.message}>
              Baixando informações da nuvem.
            </TextInter>
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
              Sincronização Concluída
            </TextInter>
            <Divider height={10} />
            <TextInter color={colors.dark[20]} style={styles.message}>
              {pendingCount > 0
                ? "Topografias enviadas com sucesso."
                : "Nenhuma topografia pendente para enviar."}
            </TextInter>
            <Divider />
            <LongButton title="Ok" onPress={handleDismissModal} />
          </>
        );

      case "error":
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
              Erro no Envio
            </TextInter>
            <Divider height={10} />
            <TextInter color={colors.dark[20]} style={styles.message}>
              {errorMessage || "Ocorreu um erro inesperado."}
            </TextInter>
            <Divider />
            <LongButton
              title="Tentar Novamente"
              onPress={handleUploadConfirm}
            />
            <Divider height={8} />
            <LongButton title="Fechar" onPress={onClose} mode="cancel" />
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
