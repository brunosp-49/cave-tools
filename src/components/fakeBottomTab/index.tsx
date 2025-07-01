// components/FakeBottomTab.tsx (Versão Unificada)

import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { colors } from "../../assets/colors";
import PlusIcon from "../icons/plusIcon";
import useKeyboard from "../../hook";
import DashboardIcon from "../icons/dashboardIcon";
import HomeIcon from "../icons/homeIcon";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  onPress: () => void;
}

export const FakeBottomTab: React.FC<Props> = ({ onPress }) => {
  const isKeyboardOpen = useKeyboard();
  const navigation = useNavigation<BottomTabNavigationProp<ParamListBase>>();
  const insets = useSafeAreaInsets(); // Hook para a Safe Area (usado apenas no iOS)

  // Oculta o componente se o teclado estiver aberto, para ambas as plataformas
  if (isKeyboardOpen) {
    return null;
  }

  // --- RENDERIZAÇÃO ESPECÍFICA PARA O iOS ---
  if (Platform.OS === "ios") {
    return (
      // Container absoluto que flutua sobre a tela
      <View style={styles.absoluteContainerIos}>
        {/* Container interno que organiza os ícones e respeita a Safe Area */}
        <View
          style={[styles.innerContainerIos, { paddingBottom: insets.bottom }]}
        >
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => navigation.navigate("HomeScreen")}
          >
            <HomeIcon />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonContainerCircleStyle}
            onPress={onPress}
          >
            <PlusIcon />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => navigation.navigate("Dashboard")}
          >
            <DashboardIcon />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- RENDERIZAÇÃO PADRÃO PARA O ANDROID (E OUTROS) ---
  return (
    <View style={styles.containerAndroid}>
      <View style={styles.iconWrapperAndroid}>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => navigation.navigate("HomeScreen")}
        >
          <HomeIcon />
        </TouchableOpacity>
      </View>
      <View style={styles.iconWrapperAndroid}>
        <TouchableOpacity
          style={styles.buttonContainerCircleStyle}
          onPress={onPress}
        >
          <PlusIcon />
        </TouchableOpacity>
      </View>
      <View style={styles.iconWrapperAndroid}>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => navigation.navigate("Dashboard")}
        >
          <DashboardIcon />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- STYLES UNIFICADOS ---
const styles = StyleSheet.create({
  // Estilos para iOS
  absoluteContainerIos: {
    position: "absolute", // Chave da correção para o iOS
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.dark[100],
  },
  innerContainerIos: {
    height: 104,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    justifyContent: "space-around",
  },

  // Estilos para Android (baseado no seu código original)
  containerAndroid: {
    flexDirection: "row",
    backgroundColor: colors.dark[100],
    height: 84,
    borderTopWidth: 0,
    alignItems: "center",
    justifyContent: "space-around",
  },
  iconWrapperAndroid: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  // Estilos Comuns para ambas as plataformas
  buttonContainerCircleStyle: {
    backgroundColor: colors.accent[100],
    height: 58,
    width: 58,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 29,
  },
  buttonContainer: {
    height: 58,
    width: 58,
    justifyContent: "center",
    alignItems: "center",
  },
});
