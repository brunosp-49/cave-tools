import React from "react";
import { SvgIconProps } from "../../types";
import { Path, Svg } from "react-native-svg";

const LinesMenu: React.FC<SvgIconProps> = ({ size = 49 }) => {
  return (
    <Svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <Path fill="#fff" d="M3 4h18v2H3zm6 7h12v2H9zm-6 7h18v2H3z"></Path>
    </Svg>
  );
};

export default LinesMenu;
