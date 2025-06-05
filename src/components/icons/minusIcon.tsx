
import React from "react";
import { SvgIconProps } from "../../types";
import { Path, Svg} from "react-native-svg";

const MinusIcon: React.FC<SvgIconProps> = ({ size = 49 }) => {
  return (
    <Svg width="24" height="4" viewBox="0 0 24 4" fill="none">
      <Path d="M0 4H24V0H0V4Z" fill="white" />
    </Svg>
  );
};

export default MinusIcon;
