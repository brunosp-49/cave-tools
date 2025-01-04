import { FC } from "react";
import { StyleSheet, View } from "react-native";
import TextInter from "../textInter";
import { colors } from "../../assets/colors";
import { Divider } from "../divider";

interface LabelTextProps {
  label: string;
  text: string;
}

export const LabelText: FC<LabelTextProps> = ({ label, text }) => {
  return (
    <View style={styles.container}>
      <TextInter color={colors.white[80]} fontSize={13}>
        {label}
      </TextInter>
      <Divider height={10} />
      <TextInter color={colors.white[100]} weight="regular">
        {text}
      </TextInter>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});
