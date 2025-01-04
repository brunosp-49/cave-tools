import React, { FC, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TextInter from "../textInter";
import { colors } from "../../assets/colors";

interface CollapseProps {
  children: React.ReactNode;
  title: string;
}

export const Collapse: FC<CollapseProps> = ({ children, title }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.collapseHeader}
        onPress={() => setIsOpen(!isOpen)}
      >
        <TextInter color={colors.white[80]} weight="semi-bold" fontSize={13}>
          {title}
        </TextInter>
        <View style={styles.subContainerHeader}>
          <TextInter color={colors.white[80]} fontSize={11} weight="regular">
            Report
          </TextInter>
          <Ionicons name="chevron-down" size={12} color={colors.white[80]} />
        </View>
      </TouchableOpacity>
      {isOpen && <View style={styles.bodyContainer}>{children}</View>}
    </>
  );
};

const styles = StyleSheet.create({
  collapseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    height: 45,
    borderWidth: 1,
    borderColor: "#30434F",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  subContainerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 50,
  },
  bodyContainer: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#30434F",
    height: 288,
    width: "100%",
  },
});
