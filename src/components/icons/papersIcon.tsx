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
        d="M25.6666 10.875H10.9999C10.0275 10.875 9.09483 11.2569 8.40719 11.9367C7.71956 12.6166 7.33325 13.5386 7.33325 14.5V43.5C7.33325 44.4614 7.71956 45.3834 8.40719 46.0633C9.09483 46.7431 10.0275 47.125 10.9999 47.125H32.9999C33.9724 47.125 34.905 46.7431 35.5926 46.0633C36.2803 45.3834 36.6666 44.4614 36.6666 43.5V21.75L25.6666 10.875Z"
        fill={disabled ? "#36b97c56" : "#36B97C"}
        fill-opacity="0.16"
        stroke={disabled ? "#20b57073" : "#20B56F"}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M25.6667 10.875V21.75H36.6667"
        fill={disabled ? "#36b97c56" : "#36B97C"}
        fill-opacity="0.16"
      />
      <Path
        d="M25.6667 10.875V21.75H36.6667"
        stroke={disabled ? "#20b57073" : "#20B56F"}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M29.3334 30.8125H14.6667"
        stroke={disabled ? "#20b57073" : "#20B56F"}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M29.3334 38.0625H14.6667"
        stroke={disabled ? "#20b57073" : "#20B56F"}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <Path
        d="M18.3334 23.5625H16.5001H14.6667"
        fill={disabled ? "#36b97c56" : "#36B97C"}
        fill-opacity="0.16"
      />
      <Path
        d="M18.3334 23.5625H16.5001H14.6667"
        stroke={disabled ? "#20b57073" : "#20B56F"}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </Svg>
  );
};

export default PapersIcon;
