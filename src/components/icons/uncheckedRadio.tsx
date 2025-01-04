import React from "react";
import { SvgIconProps } from "../../types";
import { Rect, Svg } from "react-native-svg";

const UncheckedRadio: React.FC<SvgIconProps> = ({ size = 49 }) => {
  return (
    <Svg width="21" height="22" fill="none" viewBox="0 0 21 22">
      <Rect
        width="20"
        height="20"
        x="0.5"
        y="0.589"
        stroke="#B6C2D0"
        rx="10"
      ></Rect>
    </Svg>
  );
};

export default UncheckedRadio;
