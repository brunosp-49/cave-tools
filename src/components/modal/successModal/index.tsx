import { Modal, View, StyleSheet } from "react-native";
import { colors } from "../../../assets/colors";
import TextInter from "../../textInter";
import { Divider } from "../../divider";
import { LongButton } from "../../longButton";
import { FC } from "react";
import SuccessIcon from "../../icons/successIcon";

interface SuccessModalProps {
  visible: boolean;
  title: string;
  message: string;
  onPress: () => void;
}

export const SuccessModal: FC<SuccessModalProps> = ({
  message,
  onPress,
  title,
  visible,
}) => {
  return (
    <Modal visible={visible} transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TextInter
            color={colors.white[90]}
            fontSize={23}
            style={styles.title}
          >
            {title}
          </TextInter>
          <Divider height={16} />
          <SuccessIcon />
          <Divider height={16} />
          <TextInter
            color={colors.dark[20]}
            weight="regular"
            style={styles.message}
          >
            {message}
          </TextInter>
          <Divider />
          <LongButton title="Fechar" onPress={() => onPress()} />
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
    paddingHorizontal: 20,
  },
});
