import React from "react";
import { SvgIconProps } from "../../types";
import { Path, Svg, Rect } from "react-native-svg";

const CheckedBox: React.FC<SvgIconProps> = ({ size = 49 }) => {
  return (
    <Svg width="21" height="22" fill="none" viewBox="0 0 21 22">
      <Rect width="21" height="21" y="0.089" fill="#20B56F" rx="5.25"></Rect>
      <Path fill="#20B56F" d="M6.563 7.964h8.163v5.827H6.563z"></Path>
      <Path
        stroke="#fff"
        strokeLinecap="round"
        strokeWidth="1.313"
        d="m6.563 10.878 3.498 2.913 4.665-5.827"
      ></Path>
    </Svg>
  );
};

export default CheckedBox;
