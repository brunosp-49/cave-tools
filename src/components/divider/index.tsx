import { FC } from "react";
import { StyleSheet, View } from "react-native";

interface DividerProps {
  height?: number;
}

export const Divider: FC<DividerProps> = ({ height }) => {
  return <View style={height ? { height } : styles.container} />;
};

const styles = StyleSheet.create({
  container: {
    height: 24,
  },
});
