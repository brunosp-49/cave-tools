import {
  Animated,
  FlatList,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";
import { Header } from "../../components/header";
import { colors } from "../../assets/colors";
import TextInter from "../../components/textInter";
import { FC, useCallback, useRef, useState } from "react";
import { RouterProps } from "../../types";
import { useAppSelector } from "../../hook";
import { MenuCard } from "../home/components/menuCard";
import { Divider } from "../../components/divider";
import { useDispatch } from "react-redux";
import { useInternetConnection } from "../../hook/useInternetConnection";

export const TopographyScreen: FC<RouterProps> = ({ navigation }) => {
  const dispatch = useDispatch();

  const { userName } = useAppSelector((state) => state.user);
  const isConnected = useInternetConnection();

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        <Header title="Topografia" navigation={navigation} />
        <Divider height={50} />
        <TextInter fontSize={19} weight="medium" color={colors.white[100]}>
          Selecione o que deseja fazer
        </TextInter>
        <Divider height={10} />
        <FlatList
          data={[
            {
              title: "Inserir informações topográficas",
              // icon: <PieChartIcon />,
              icon: null,
              id: 4,
              onPress: () => navigation.navigate("Dashboard"),
              disabled: false,
            },
            {
              title: "Editar informações topográficas",
              // icon: <PapersIcon />,
              icon: null,
              id: 5,
              onPress: () => navigation.navigate("ProjectScreen"),
              disabled: false,
            },
            {
              title: "Visualizar informações topográficas",
              icon: null,
              // icon: (
              //   <Ionicons
              //     name="cloud-upload"
              //     size={42}
              //     color={isConnected ? colors.accent[100] : colors.accent[30]}
              //     style={{ marginRight: 4 }}
              //   />
              // ),
              id: 6,
              // onPress: () => setIsUploadModalVisible(true),
              disabled: !isConnected,
            },
          ]}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <MenuCard
              icon={item.icon}
              title={item.title}
              onPress={() => item.onPress}
              disabled={item.id === 2 || item.id === 3 || !isConnected}
            />
          )}
          ItemSeparatorComponent={({}) => <Divider height={16} />}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    backgroundColor: colors.dark[90],
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
});
