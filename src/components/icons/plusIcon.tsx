import React from "react";
import { SvgIconProps } from "../../types";
import { G, Path, Svg, Defs, ClipPath } from "react-native-svg";

const PlusIcon: React.FC<SvgIconProps> = ({ size = 49 }) => {
  return (
    <Svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <G clipPath="url(#clip0_2079_7195)">
        <Path
          stroke="#fff"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.571"
          d="M2 12.286H22.57M12.286 22.57V2"
        ></Path>
      </G>
      <Defs>
        <ClipPath id="clip0_2079_7195">
          <Path fill="#fff" d="M0 0h24v24H0z"></Path>
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default PlusIcon;
