import React from "react";
import { SvgIconProps } from "../../types";
import { Path, Svg } from "react-native-svg";

const HomeIcon: React.FC<SvgIconProps> = ({ size = 49 }) => {
  return (
    <Svg width="28" height="28" fill="none" viewBox="0 0 28 28">
      <Path
        fill="#939FAD"
        d="M24.5 23.333c0 .645-.522 1.167-1.167 1.167H4.667A1.167 1.167 0 0 1 3.5 23.333V11.071c0-.36.166-.7.45-.921l9.334-7.26a1.166 1.166 0 0 1 1.432 0l9.333 7.26c.285.22.451.56.451.92zm-2.333-1.166V11.64L14 5.29l-8.167 6.352v10.526zm-14-4.667h11.666v2.333H8.167z"
      ></Path>
    </Svg>
  );
};

export default HomeIcon;
