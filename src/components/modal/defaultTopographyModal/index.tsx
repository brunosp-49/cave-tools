import React, { FC } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../assets/colors";
import TextInter from "../../textInter";
import { ReturnButton } from "../../button/returnButton";
import { LongButton } from "../../longButton";

// Interface de props atualizada para aceitar funções async
interface DefaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  children?: React.ReactNode;

  // Callbacks de ação
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  onBack?: () => void; // Para o botão 'X' ou de fechar

  // Configuração dos botões
  titleButtonConfirm?: string;
  titleButtonCancel?: string;
  enableLongButton?: boolean;
  enableBackButton?: boolean; // Para o botão de voltar/cancelar no rodapé
  visibleIcon?: boolean; // Prop que já existia no seu uso
}

export const DefaultTopographyModal: FC<DefaultModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  children,
  onConfirm,
  onCancel,
  onBack,
  titleButtonConfirm,
  titleButtonCancel,
  enableLongButton,
  enableBackButton,
  visibleIcon = true,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isOpen}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent}>
          {onBack && (
            <TouchableOpacity style={styles.closeButton} onPress={onBack}>
              <Ionicons name="close" size={30} color={colors.white[100]} />
            </TouchableOpacity>
          )}

          {visibleIcon && (
            <View style={styles.iconContainer}>
              <Ionicons
                name="checkmark-circle-outline"
                size={60}
                color={colors.accent[100]}
              />
            </View>
          )}

          <TextInter weight="bold" style={styles.title}>
            {title}
          </TextInter>
          <TextInter style={styles.message}>{message}</TextInter>

          {children}

          <View style={styles.buttonContainer}>
            {enableBackButton && titleButtonCancel && onCancel && (
              <View style={styles.buttonWrapper}>
                <ReturnButton
                  buttonTitle={titleButtonCancel}
                  onPress={onCancel}
                  customWidth={100}
                />
              </View>
            )}
            {enableLongButton && titleButtonConfirm && onConfirm && (
              <View style={styles.buttonWrapper}>
                <LongButton title={titleButtonConfirm} onPress={onConfirm} />
              </View>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: colors.dark[80],
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    color: colors.white[100],
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: colors.white[80],
    textAlign: "center",
    marginBottom: 24,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 10,
  },
  buttonWrapper: {
    width: "100%",
    marginBottom: 12,
  },
});
