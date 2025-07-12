// navigation/DrawerNavigator.tsx
import React, { FC, useCallback, useEffect } from "react";
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
import { BackHandler, Modal, StyleSheet, View } from "react-native";
import TextInter from "../components/textInter";
import { Divider } from "../components/divider";
import { LongButton } from "../components/longButton";
import RegisterProject from "../view/registerProject";
import SearchCavity from "../view/searchCavity";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { CavityScreen } from "../view/cavity";
import {
  deleteAllCavities,
  deleteAllProjects,
  deleteAllTopographies,
  deleteUser,
  fetchAllUsers,
} from "../db/controller";
import { DefaultModal } from "../components/modal/defaultModal";
import { useInternetConnection } from "../hook/useInternetConnection";
import { resetModalState, setModalLoading } from "../redux/userSlice";
import { useDispatch } from "react-redux";
import { resetLoadingState, setIsCheckingLoading } from "../redux/loadingSlice";
import { useAppSelector } from "../hook";
import { ProjectScreen } from "../view/project";
import SearchProject from "../view/searchProject";
import EditProject from "../view/editProject";
import EditCavity from "../view/editCavity";
import RegisterCavity from "../view/registerCavity";
import { TopographyScreen } from "../view/topography";
import { DetailScreenCavity } from "../view/detailScreenCavity";
import { DetailScreenProject } from "../view/detailScreenProject";
import { HomeScreen } from "../view/home";
import Dashboard from "../view/dashboard";
import TopographyCreateScreen from "../view/TopographyCreate";
import AttentionIcon from "../components/icons/attentionIcon";
import TopographyDetailScreen from "../view/topographyDetails";
import TopographyListScreen from "../view/topographyListScreen";

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false, drawerPosition: "right" }}
      initialRouteName="Login"
    >
      {/* <Drawer.Screen
        name="Tabs"
        component={BottomTabNavigator}
        options={{ title: "Home" }}
      /> */}
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
        name="RegisterCavity"
        component={RegisterCavity}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="SearchCavity"
        component={SearchCavity}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="SearchProject"
        component={SearchProject}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="CavityScreen"
        component={CavityScreen}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="ProjectScreen"
        component={ProjectScreen}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="EditProject"
        component={EditProject}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="EditCavity"
        component={EditCavity}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="TopographyScreen"
        component={TopographyScreen}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="TopographyDetailScreen"
        component={TopographyDetailScreen}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="TopographyCreateScreen"
        component={TopographyCreateScreen}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="DetailScreenProject"
        component={DetailScreenProject}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="DetailScreenCavity"
        component={DetailScreenCavity}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="Dashboard"
        component={Dashboard}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="TopographyListScreen"
        component={TopographyListScreen}
        options={{ headerShown: false }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const { navigation, state } = props;
  const [confirmModalVisible, setConfirmModalVisible] = React.useState(false);
  const isConnected = useInternetConnection();
  const dispatch = useDispatch();
  const { userName } = useAppSelector((state) => state.user);

  // Determine the active route
  const activeRouteIndex = state?.index;
  const activeRouteName = state?.routeNames[activeRouteIndex];

  const logoff = useCallback(async () => {
    try {
      dispatch(setModalLoading(true));
      await deleteAllProjects();
      await deleteAllCavities();
      await deleteAllTopographies();
      dispatch(resetModalState());
      await deleteUser("2");
      dispatch(resetLoadingState());
      dispatch(setModalLoading(false));
      setConfirmModalVisible(false);
      navigation.navigate("Login");
    } catch (error) {
      console.error("Error during logoff:", error);
      dispatch(setModalLoading(false));
    }
  }, [dispatch, navigation]);

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
          <TextInter color={colors.dark[60]}>👋 Olá!!</TextInter>
          <TextInter fontSize={23} weight="medium" color={colors.white[90]}>
            {userName.split(" ")[0]}
          </TextInter>
        </View>
        <Divider height={15} />
        <DrawerItem
          icon={() => (
            <AntDesign name="home" size={20} color={colors.white[100]} />
          )}
          label="Início"
          onPress={() => navigation.navigate("HomeScreen")}
          style={{
            borderRadius: 10,
            backgroundColor:
              activeRouteName === "HomeScreen" ? colors.accent[100] : undefined,
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
          onPress={() => navigation.navigate("Dashboard")}
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
              name="pie-chart-outline"
              size={20}
              color={colors.white[100]}
            />
          )}
          label="Topografia"
          onPress={() => navigation.navigate("TopographyScreen")}
          style={{
            borderRadius: 10,
            backgroundColor:
              activeRouteName === "TopographyScreen"
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
      <LongButton
        title="Sair"
        onPress={() => setConfirmModalVisible(true)}
        disabled={!isConnected}
      />
      <LogoffModal
        isOpen={confirmModalVisible}
        onClose={() => setConfirmModalVisible(false)}
        onConfirm={logoff}
        title="Atenção! Deseja sair?"
        message="Ao sair, você perderá todas as cavidades não salvas online."
      />
    </DrawerContentScrollView>
  );
};

interface DefaultModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
  titleButtonConfirm?: string;
  onCustomCancel?: () => void;
  titleButtonCancel?: string;
}

const LogoffModal: FC<DefaultModalProps> = ({
  isOpen,
  message,
  onClose,
  onConfirm,
  title,
  titleButtonCancel,
  titleButtonConfirm,
  onCustomCancel,
}) => {
  return (
    <Modal visible={isOpen} transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TextInter
            color={colors.white[100]}
            fontSize={23}
            style={styles.title}
          >
            {title}
          </TextInter>
          <Divider height={16} />
          <AttentionIcon />
          <Divider height={16} />
          <TextInter
            color={colors.warning[100]}
            weight="bold"
            fontSize={16}
            style={styles.message}
          >
            {message}
          </TextInter>
          <Divider />
          <View style={styles.buttonContainer}>
            <LongButton
              mode="cancel"
              numberOfButtons={2}
              title={titleButtonCancel ? titleButtonCancel : "Cancelar"}
              onPress={() => (onCustomCancel ? onCustomCancel() : onClose())}
            />
            <LongButton
              numberOfButtons={2}
              title={titleButtonConfirm ? titleButtonConfirm : "Confirmar"}
              onPress={() => onConfirm()}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(0,0,0,0.5)",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    backgroundColor: colors.dark[30],
    width: "90%",
    height: "auto",
    minHeight: 250,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  title: {
    textAlign: "center",
  },
  message: {
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});
