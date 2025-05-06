// src/components/progressBar.tsx (or wherever it is)

import React, { useEffect, useState } from "react";
import { View, StyleSheet, DimensionValue } from "react-native";
import { colors } from "../../assets/colors";
import TextInter from "../textInter";
import { Divider } from "../divider";

interface ProgressBarProps {
  currentProgress: number;
  width?: DimensionValue;
  hideLabel?: boolean;
}

const UploadProgressBar: React.FC<ProgressBarProps> = ({
  width = "100%",
  currentProgress,
  hideLabel = false,
}) => {
  const progress = Math.max(0, Math.min(100, Math.round(currentProgress)));

  return (
    <View style={[styles.wrapper, { width }]}>
      <View style={styles.container}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      {!hideLabel && (
        <>
          <Divider height={12} />
          <TextInter fontSize={14} color={colors.white[100]}>
            {progress}%
          </TextInter>
          <Divider height={12} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
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

export default UploadProgressBar;
