import { TouchableOpacity } from "react-native";
import { colors } from "../../../assets/colors";
import TextInter from "../../textInter";
import React from "react";

interface Props {
  onPress: () => void;
  disabled?: boolean;
  buttonTitle?: string;
  customWidth?: number;
}

export const ReturnButton: React.FC<Props> = ({
  onPress,
  disabled,
  buttonTitle,
  customWidth = 47,
}) => {
  return (
    <TouchableOpacity
      style={{
        height: 58,
        width: `${customWidth}%`,
        backgroundColor: colors.dark[40],
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
      }}
      onPress={onPress}
      disabled={disabled}
    >
      <TextInter color={colors.white[100]} weight="semi-bold">
        {buttonTitle ? buttonTitle : "Voltar"}
      </TextInter>
    </TouchableOpacity>
  );
};
