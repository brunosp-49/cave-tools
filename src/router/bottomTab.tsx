import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { colors } from "../assets/colors";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import PlusIcon from "../components/icons/plusIcon";
import DashboardIcon from "../components/icons/dashboardIcon";
import HomeIcon from "../components/icons/homeIcon";
import RegisterCavity from "../view/registerCavity";
import Dashboard from "../view/dashboard";
import HomeIconSelected from "../components/icons/homeIconSelected";
import DashboardIconSelected from "../components/icons/dashboardIconSelected";
import { HomeScreen } from "../view/home";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { ParamListBase } from "@react-navigation/native";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarHideOnKeyboard: true,
        tabBarIconStyle: {
          flex: 1,
        },
        tabBarStyle: {
          backgroundColor: colors.dark[100],
          height: Platform.OS === "ios" ? 110 : 84,
          borderTopWidth: 0,
          alignItems: "center",
          justifyContent: "center",
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#e91e63",
      }}
      initialRouteName="Home"
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <View style={styles.iconContainer}>
              <View style={styles.buttonContainer}>
                {focused ? <HomeIconSelected /> : <HomeIcon />}
              </View>
            </View>
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="addButton"
        component={RegisterCavity} // Set the component to RegisterCavity
        options={{
          tabBarButton: (props) => {
            const navigation =
              useNavigation<BottomTabNavigationProp<ParamListBase>>();
            return (
              <View style={styles.iconContainer}>
                <TouchableOpacity
                  style={styles.buttonContainerCircle}
                  onPress={() => navigation.navigate("RegisterCavity")} // Navigate to RegisterCavity
                >
                  <PlusIcon />
                </TouchableOpacity>
              </View>
            );
          },
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <View style={styles.iconContainer}>
              <View style={styles.buttonContainer}>
                {focused ? <DashboardIconSelected /> : <DashboardIcon />}
              </View>
            </View>
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

const styles = StyleSheet.create({
  iconContainer: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: Platform.OS === "ios" ? "flex-end" : "center",
    alignSelf: "center",
  },
  buttonContainerCircle: {
    backgroundColor: colors.accent[100],
    height: 58,
    width: 58,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 58 / 2,
  },
  buttonContainer: {
    height: 58,
    width: 58,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 58 / 2,
  },
});
