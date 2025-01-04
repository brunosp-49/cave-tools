import React from "react";
import { SvgIconProps } from "../../types";
import { Rect, Svg } from "react-native-svg";

const CheckedRadio: React.FC<SvgIconProps> = ({ size = 49 }) => {
  return (
    <Svg width="21" height="22" fill="none" viewBox="0 0 21 22">
      <Rect
        width="16"
        height="16"
        x="2.5"
        y="2.589"
        stroke="#36B97C"
        strokeWidth="5"
        rx="8"
      ></Rect>
    </Svg>
  );
};

export default CheckedRadio;
