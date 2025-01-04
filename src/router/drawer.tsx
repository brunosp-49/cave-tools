// navigation/DrawerNavigator.tsx
import React from "react";
import { HomeScreen } from "../view/home";
import BottomTabNavigator from "./bottomTab";
import { Login } from "../view/login";
import { Register } from "../view/register";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  createDrawerNavigator,
} from "@react-navigation/drawer";
import { colors } from "../assets/colors";
import { View } from "react-native";
import TextInter from "../components/textInter";
import { Divider } from "../components/divider";
import { LongButton } from "../components/longButton";
import RegisterProject from "../view/registerProject";
import SearchCavity from "../view/searchCavity";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from '@expo/vector-icons/AntDesign';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false, drawerPosition: "right" }}
      initialRouteName="Login"
    >
      <Drawer.Screen
        name="Tabs"
        component={BottomTabNavigator}
        options={{ title: "Home" }}
      />
      <Drawer.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="Register"
        component={Register}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="RegisterProject"
        component={RegisterProject}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="SearchCavity"
        component={SearchCavity}
        options={{ headerShown: false }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const { navigation, state } = props;

  // Determine the active route
  const activeRouteIndex = state?.index;
  const activeRouteName = state?.routeNames[activeRouteIndex];

  return (
    <DrawerContentScrollView
      contentContainerStyle={{
        justifyContent: "space-between",
        flex: 1,
        paddingBottom: 50,
      }}
      style={{
        backgroundColor: colors.dark[90],
        padding: 12,
      }}
      {...props}
    >
      <View>
        <View style={{ paddingLeft: 0 }}>
          <TextInter color={colors.dark[60]}>👋 Olá!</TextInter>
          <TextInter fontSize={23} weight="medium" color={colors.white[90]}>
            Fernanda
          </TextInter>
        </View>
        <Divider height={15} />
        <DrawerItem
          icon={() => (
            <AntDesign name="home" size={20} color={colors.white[100]} />
          )}
          label="Início"
          onPress={() => navigation.navigate("Tabs", { screen: "Home" })}
          style={{
            borderRadius: 10,
            backgroundColor:
              activeRouteName === "Tabs" ? colors.accent[100] : undefined,
          }}
          labelStyle={{
            color: colors.white[90],
            fontSize: 14,
          }}
        />
        <DrawerItem
          icon={() => (
            <Ionicons name="add-outline" size={20} color={colors.white[100]} />
          )}
          label="Cadastrar Projeto"
          onPress={() => navigation.navigate("RegisterProject")}
          style={{
            borderRadius: 10,
            backgroundColor:
              activeRouteName === "RegisterProject"
                ? colors.accent[100]
                : undefined,
          }}
          labelStyle={{
            color: colors.white[90],
            fontSize: 14,
          }}
        />
        <DrawerItem
          icon={() => (
            <Ionicons
              name="pie-chart-outline"
              size={20}
              color={colors.white[100]}
            />
          )}
          label="Dashboard"
          onPress={() => navigation.navigate("Tabs", { screen: "Dashboard" })}
          style={{
            borderRadius: 10,
            backgroundColor:
              activeRouteName === "Dashboard" ? colors.accent[100] : undefined,
          }}
          labelStyle={{
            color: colors.white[90],
            fontSize: 14,
          }}
        />
        <DrawerItem
          icon={() => (
            <Ionicons
              name="search-outline"
              size={20}
              color={colors.white[100]}
            />
          )}
          label="Encontrar Ficha de Caracterizações"
          onPress={() => navigation.navigate("SearchCavity")}
          style={{
            borderRadius: 10,
            backgroundColor:
              activeRouteName === "SearchCavity"
                ? colors.accent[100]
                : undefined,
          }}
          labelStyle={{
            color: colors.white[90],
            fontSize: 14,
          }}
        />
      </View>
      <LongButton title="Sair" onPress={() => navigation.navigate("Login")} />
    </DrawerContentScrollView>
  );
};
