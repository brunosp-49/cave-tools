import React from "react";
import { SvgIconProps } from "../../types";
import { Path, Svg } from "react-native-svg";

const ArrowCircleLeftIcon: React.FC<SvgIconProps> = ({ size = 49 }) => {
  return (
    <Svg width="49" height="51" fill="none" viewBox="0 0 49 51">
      <Path
        stroke="#3F4C54"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        strokeWidth="2.178"
        d="M47.457 25.044c0 12.68-10.278 22.958-22.957 22.958S1.542 37.724 1.542 25.044 11.82 2.087 24.5 2.087s22.957 10.278 22.957 22.957"
      ></Path>
      <Path
        stroke="#939FAD"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m27.53 33.533-8.464-8.489 8.465-8.488"
      ></Path>
    </Svg>
  );
};

export default ArrowCircleLeftIcon;
