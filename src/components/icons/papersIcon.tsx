import React from "react";
import { SvgIconProps } from "../../types";
import { Path, Svg } from "react-native-svg";

const PapersIcon: React.FC<SvgIconProps> = ({ size = 49, disabled = false }) => {
  return (
    <Svg
      width="44"
      height="58"
      viewBox="0 0 44 58"
      fill="none"
    >
      <Path
        d="M25.6667 10.875H11C10.0276 10.875 9.09495 11.2569 8.40732 11.9367C7.71968 12.6166 7.33337 13.5386 7.33337 14.5V43.5C7.33337 44.4614 7.71968 45.3834 8.40732 46.0633C9.09495 46.7431 10.0276 47.125 11 47.125H33C33.9725 47.125 34.9051 46.7431 35.5928 46.0633C36.2804 45.3834 36.6667 44.4614 36.6667 43.5V21.75L25.6667 10.875Z"
        fill={disabled ? "#36b97c56" : "#36B97C"}
        fill-opacity="0.16"
        stroke={disabled ? "#20b57073" : "#20B56F"}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M25.6666 10.875V21.75H36.6666"
        fill={disabled ? "#36b97c56" : "#36B97C"}
        fill-opacity="0.16"
      />
      <Path
        d="M25.6666 10.875V21.75H36.6666"
        stroke={disabled ? "#20b57073" : "#20B56F"}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M29.3333 30.8125H14.6666"
        stroke={disabled ? "#20b57073" : "#20B56F"}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M29.3333 38.0625H14.6666"
        stroke={disabled ? "#20b57073" : "#20B56F"}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M18.3333 23.5625H16.5H14.6666"
        fill={disabled ? "#36b97c56" : "#36B97C"}
        fill-opacity="0.16"
      />
      <Path
        d="M18.3333 23.5625H16.5H14.6666"
        stroke={disabled ? "#20b57073" : "#20B56F"}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
};

export default PapersIcon;
