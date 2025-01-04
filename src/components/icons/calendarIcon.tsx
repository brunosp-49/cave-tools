import React from "react";
import { SvgIconProps } from "../../types";
import { Path, Svg } from "react-native-svg";

const CalendarIcon: React.FC<SvgIconProps> = ({ size = 49 }) => {
  return (
    <Svg width="18" height="18" fill="none" viewBox="0 0 18 18">
      <Path
        stroke="#939FAD"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.25"
        d="M14.25 3H3.75a1.5 1.5 0 0 0-1.5 1.5V15a1.5 1.5 0 0 0 1.5 1.5h10.5a1.5 1.5 0 0 0 1.5-1.5V4.5a1.5 1.5 0 0 0-1.5-1.5M12 1.5v3M6 1.5v3M2.25 7.5h13.5"
      ></Path>
    </Svg>
  );
};

export default CalendarIcon;
