import { FC } from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../../assets/colors";

interface DividerColorLineProps {
  height?: number;
}

export const DividerColorLine: FC<DividerColorLineProps> = ({ height }) => {
  return (
    <View style={height ? { ...styles.container, marginVertical: height } : styles.container} />
  );
};

const styles = StyleSheet.create({
  container: {
    height: 1,
    marginVertical: 12,
    width: "100%",
    backgroundColor: colors.dark[40],
  },
});
