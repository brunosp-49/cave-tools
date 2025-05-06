import React from "react";
import { SvgIconProps } from "../../types";
import { Path, Svg } from "react-native-svg";

const PieChartIcon: React.FC<SvgIconProps> = ({
  size = 49,
  disabled = false,
}) => {
  return (
    <Svg width="47" height="47" viewBox="0 0 47 47" fill="none">
      <Path
        d="M21.5416 3.9165V43.0832C11.5541 42.104 3.91663 33.6832 3.91663 23.4998C3.91663 13.3165 11.5541 4.89567 21.5416 3.9165ZM25.4583 3.9165V21.5415H43.0833C42.1041 12.1415 34.8583 4.89567 25.4583 3.9165ZM25.4583 25.4582V43.0832C34.6625 42.104 42.1041 34.8582 43.0833 25.4582H25.4583Z"
        fill={disabled ? "#36B97C" : "#36B97C"}
      />
    </Svg>
  );
};

export default PieChartIcon;
