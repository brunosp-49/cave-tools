import React from "react";
import { SvgIconProps } from "../../types";
import { Path, Svg } from "react-native-svg";

const UploadIcon: React.FC<SvgIconProps> = ({ size = 49 }) => {
  return (
    <Svg width="29" height="29" fill="none" viewBox="0 0 29 29">
      <Path
        stroke="#939FAD"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.396"
        d="M25.281 18.183v4.791a2.396 2.396 0 0 1-2.396 2.396H6.115a2.396 2.396 0 0 1-2.396-2.396v-4.791M20.49 9.797l-5.99-5.99-5.99 5.99M14.5 3.808v14.375"
      ></Path>
    </Svg>
  );
};

export default UploadIcon;
