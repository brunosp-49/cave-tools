import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Divider } from "../../../components/divider";
import { Select } from "../../../components/select";
import { Input } from "../../../components/input";
import TextInter from "../../../components/textInter";
import { colors } from "../../../assets/colors";
import { Ionicons } from "@expo/vector-icons";
import { Collapse } from "../../../components/collapse";
import PieChart from "react-native-pie-chart";

export const StepTwo = () => {
  const pieData = [
    {
      value: 25.6,
      color: colors.opposite[100],
      label: { text: "25.6%", fontWeight: "bold", fill: colors.white[100] },
    },
    {
      value: 32,
      color: colors.opposite[90],
      label: { text: "32.0%", fontWeight: "bold", fill: colors.white[100] },
    },
    {
      value: 23.8,
      color: colors.opposite[80],
      label: { text: "23.8%", fontWeight: "bold", fill: colors.white[100] },
    },
    {
      value: 9.9,
      color: colors.opposite[70],
      label: { text: "9.9%", fontWeight: "bold", fill: colors.white[100] },
    },
    {
      value: 8.7,
      color: colors.opposite[60],
      label: { text: "8.7%", fontWeight: "bold", fill: colors.white[100] },
    },
  ];

  return (
    <View style={styles.container}>
      <Divider />
      <Collapse title="Minas Gerais">
        <View style={styles.chartContainer}>
          <PieChart widthAndHeight={250} series={pieData} cover={0.64} />
        </View>
      </Collapse>
      <Divider height={10} />
      <Collapse title="São Paulo">
        <View style={styles.chartContainer}>
          <PieChart widthAndHeight={250} series={pieData} cover={0.64} />
        </View>
      </Collapse>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
    paddingBottom: 30,
  },
  chartContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
