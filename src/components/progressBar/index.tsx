import React, { useEffect, useState } from "react";
import { View, StyleSheet, DimensionValue } from "react-native";
import { colors } from "../../assets/colors";
import TextInter from "../textInter";
import { Divider } from "../divider";

interface ProgressBarProps {
  finished: boolean;
  width?: DimensionValue;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  width = "100%",
  finished,
}) => {
  const [progress, setProgress] = useState(finished ? 100 : 0);

  useEffect(() => {
    if (finished) {
      setProgress(100);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) {
          clearInterval(interval);
          return 99;
        }
        return prev + 1;
      });
    }, 90);

    return () => {
      clearInterval(interval);
    };
  }, [finished]);

  return (
    <View style={[styles.wrapper, { width }]}>
      <View style={styles.container}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      <Divider height={12} />
      <TextInter fontSize={14} color={colors.white[100]}>
        {progress}%
      </TextInter>
      <Divider height={12} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center", // center the text
  },
  container: {
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    overflow: "hidden",
    height: 20,
    width: "100%",
  },
  progressBar: {
    backgroundColor: colors.accent[100],
    height: "100%",
  },
});

export default ProgressBar;