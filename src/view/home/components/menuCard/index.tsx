import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../../../assets/colors";
import TextInter from "../../../../components/textInter";

interface MenuCardProps {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  title,
  icon,
  onPress,
  disabled,
}) => {
  return (
    <TouchableOpacity
      style={disabled ? styles.containerDisabled : styles.container}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <TextInter weight="medium" color={disabled ? colors.white[20] : colors.white[100]}>
        {title}
      </TextInter>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 100,
    backgroundColor: colors.dark[80],
    borderRadius: 10,
    padding: 16,
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
  },
  containerDisabled: {
    width: "100%",
    height: 100,
    backgroundColor: colors.dark[85],
    borderRadius: 10,
    padding: 16,
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
  },
  iconContainer: {
    marginRight: 12,
  },
});
