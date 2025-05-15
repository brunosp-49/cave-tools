// components/FakeBottomTab.tsx (Updated)
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { colors } from "../../assets/colors";
import PlusIcon from "../icons/plusIcon";
import useKeyboard from "../../hook";
import DashboardIcon from "../icons/dashboardIcon";
import HomeIcon from "../icons/homeIcon";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
interface Props {
  onPress: () => void;
}

export const FakeBottomTab: React.FC<Props> = ({ onPress }) => {
  const isKeyboardOpen = useKeyboard();
  const navigation = useNavigation<BottomTabNavigationProp<ParamListBase>>();

  return (
    <>
      {!isKeyboardOpen && (
        <View style={[styles.container, styles.bottomTabStyle]}>
          <View style={styles.iconContainer}>
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={() => navigation.navigate("Tabs", { screen: "Home" })}
            >
              <HomeIcon />
            </TouchableOpacity>
          </View>
          <View style={styles.iconContainerStyle}>
            <TouchableOpacity
              style={styles.buttonContainerCircleStyle}
              onPress={onPress}
            >
              <PlusIcon />
            </TouchableOpacity>
          </View>
          <View style={styles.iconContainer}>
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={() => navigation.navigate("Tabs", { screen: "Dashboard" })}
            >
              <DashboardIcon />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
  },
  bottomTabStyle: {
    backgroundColor: colors.dark[100],
    height: Platform.OS === "ios" ? 110 : 84,
    borderTopWidth: 0,
    alignItems: "center" as const,
    justifyContent: "space-around" as const,
  },
  iconContainerStyle: {
    height: "100%",
    alignItems: "center" as const,
    justifyContent: Platform.OS === "ios" ? "flex-end" : ("center" as const),
    alignSelf: "center" as const,
  },
  buttonContainerCircleStyle: {
    backgroundColor: colors.accent[100],
    height: 58,
    width: 58,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderRadius: 58 / 2,
  },
  buttonContainer: {
    height: 58,
    width: 58,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 58 / 2,
  },
  iconContainer: {
    height: "100%",
    alignItems: "center",
    justifyContent: Platform.OS === "ios" ? "flex-end" : "center",
    alignSelf: "center",
  },
});
