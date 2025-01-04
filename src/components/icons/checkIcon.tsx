import React from "react";
import { SvgIconProps } from "../../types";
import { Circle, Path, Svg } from "react-native-svg";

const CheckIcon: React.FC<SvgIconProps> = ({ size = 49 }) => {
  return (
  <Svg
    width="29"
    height="29"
    fill="none"
    viewBox="0 0 29 29"
  >
    <Circle
      cx="14.5"
      cy="14.5"
      r="14.5"
      fill="#36B97C"
      fillOpacity="0.2"
    ></Circle>
    <Path
      stroke="#36B97C"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.208"
      d="M22.556 13.759v.741a8.056 8.056 0 1 1-4.777-7.363"
    ></Path>
    <Path
      stroke="#36B97C"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.208"
      d="M22.556 8.056 14.5 16.119l-2.417-2.416"
    ></Path>
  </Svg>
  );
};

export default CheckIcon;
