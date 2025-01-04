import { Modal, View, StyleSheet } from "react-native";
import { colors } from "../../../assets/colors";
import TextInter from "../../textInter";
import { Divider } from "../../divider";
import ErrorIllustration from "../../icons/errorIllustration";
import { LongButton } from "../../longButton";
import { FC } from "react";
import AttentionIcon from "../../icons/attentionIcon";

interface DefaultModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
  titleButtonConfirm?: string;
  onCustomCancel?: () => void;
  titleButtonCancel: string;
}

export const DefaultModal: FC<DefaultModalProps> = ({
  isOpen,
  message,
  onClose,
  onConfirm,
  title,
  titleButtonCancel,
  titleButtonConfirm,
  onCustomCancel,
}) => {
  return (
    <Modal visible={isOpen} transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TextInter
            color={colors.white[100]}
            fontSize={23}
            style={styles.title}
          >
            {title}
          </TextInter>
          <Divider height={16} />
          <AttentionIcon />
          <Divider height={16} />
          <TextInter
            color={colors.dark[20]}
            weight="regular"
            style={styles.message}
          >
            {message}
          </TextInter>
          <Divider />
          <View style={styles.buttonContainer}>
            <LongButton
              mode="cancel"
              numberOfButtons={2}
              title={titleButtonCancel ? titleButtonCancel : "Cancelar"}
              onPress={() => (onCustomCancel ? onCustomCancel() : onClose())}
            />
            <LongButton
              numberOfButtons={2}
              title={titleButtonConfirm ? titleButtonConfirm : "Confirmar"}
              onPress={() => onConfirm()}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(0,0,0,0.5)",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    backgroundColor: colors.dark[30],
    width: "90%",
    height: "auto",
    minHeight: 250,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  title: {
    textAlign: "center",
  },
  message: {
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});
