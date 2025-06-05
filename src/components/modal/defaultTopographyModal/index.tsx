import { Modal, View, StyleSheet, type DimensionValue } from "react-native";
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
  titleButtonCancel?: string;
  visibleIcon?: boolean;
  height?: DimensionValue | undefined;
  enableLongButton?: boolean,
  enableBackButton?: boolean,
  onBack?: () => void
}

export const DefaultTopographyModal: FC<DefaultModalProps> = ({
  isOpen,
  message,
  onClose,
  onConfirm,
  title,
  titleButtonCancel,
  titleButtonConfirm,
  onCustomCancel,
  visibleIcon = true,
  height = 'auto',
  enableLongButton = false,
  enableBackButton,
  onBack
}) => {
  return (
    <Modal visible={isOpen} transparent>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { height: height }]}>
          <TextInter
            color={colors.white[100]}
            fontSize={23}
            style={styles.title}
          >
            {title}
          </TextInter>
          <Divider height={16} />
          {visibleIcon && (<AttentionIcon />)}
          <Divider height={16} />
          <TextInter
            color={colors.dark[20]}
            weight="regular"
            style={styles.message}
          >
            {message}
          </TextInter>
          <Divider />
          <View style={[styles.buttonContainer, { flexDirection: enableLongButton ? 'column' : 'row' }]}>
            <LongButton
              numberOfButtons={enableLongButton ? 1 : 2}
              title={titleButtonConfirm ? titleButtonConfirm : "Confirmar"}
              onPress={() => onConfirm()}
            />
            <LongButton
              numberOfButtons={enableLongButton ? 1 : 2}
              title={titleButtonCancel ? titleButtonCancel : "Não, cadastrar manualmente"}
              onPress={() => (onCustomCancel ? onCustomCancel() : onClose())}
            />
            {enableBackButton && (
              <LongButton
                mode="cancel"
                title="Voltar"
                onPress={() => onBack?.()}
              />
            )}
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
    gap: 10
  },
});
