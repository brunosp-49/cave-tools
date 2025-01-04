import { colors } from "../../assets/colors";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import CheckedBox from "../icons/checkedBox";
import UncheckedBox from "../icons/uncheckedBox";
import TextInter from "../textInter";

interface CheckboxProps {
  checked: boolean;
  onChange: (e: boolean) => void;
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.checkboxContainer}>
        {checked ? <CheckedBox /> : <UncheckedBox />}
      </TouchableOpacity>
      <TextInter color={colors.dark[60]}>{label}</TextInter>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 22,
    width: "100%",
    flexDirection: "row",
  },
  checkboxContainer: {
    marginRight: 10,
  },
  checkbox: {
    borderRadius: 5,
  },
});
