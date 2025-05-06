import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../assets/colors";
import TextInter from "../textInter";

interface LongButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  mode?: "cancel" | "confirm";
  numberOfButtons?: 1 | 2;
  leftIcon?: React.ReactNode;
}

export const LongButton: React.FC<LongButtonProps> = ({
  title,
  onPress,
  disabled,
  isLoading = false,
  mode = "confirm",
  numberOfButtons = 1,
  leftIcon,
}) => {
  return (
    <TouchableOpacity
      style={[
        numberOfButtons === 1 ? styles.button : styles.multipleButtons,
        mode === "confirm"
          ? { backgroundColor: colors.accent[100] }
          : { backgroundColor: colors.dark[50] },
        disabled && { backgroundColor: colors.accent[10] },
      ]}
      disabled={disabled || isLoading}
      onPress={onPress}
    >
      {isLoading ? (
        <ActivityIndicator color={colors.white[100]} size={30} />
      ) : (
        <>
          {leftIcon ? (
            <View style={styles.lefContainer}>
              <View style={styles.leftIconContainer}>{leftIcon}</View>
              <TextInter color={colors.white[100]} weight="semi-bold">
                {title}
              </TextInter>
            </View>
          ) : (
            <TextInter color={colors.white[100]} weight="semi-bold">
              {title}
            </TextInter>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 58,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  multipleButtons: {
    width: "48%",
    height: 58,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  lefContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  leftIconContainer: {
    marginRight: 8,
  },
});
