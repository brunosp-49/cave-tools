import { FlatList, Modal, SafeAreaView, StyleSheet, View } from "react-native";
import { Header } from "../../components/header";
import { colors } from "../../assets/colors";
import TextInter from "../../components/textInter";
import { Divider } from "../../components/divider";
import { FC, useState } from "react";
import { RouterProps } from "../../types";
import HatManIcon from "../../components/icons/hatManIcon";
import PapersIcon from "../../components/icons/papersIcon";
import PieChartIcon from "../../components/icons/pieChart";
import { MenuCard } from "./components/menuCard";
import BookPenIcon from "../../components/icons/bookPenIcon";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { CheckProjectsModal } from "./components/checkProjectsLoadingModal";
import { setIsCheckingLoading } from "../../redux/loadingSlice";

export const HomeScreen: FC<RouterProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const checkingState = useSelector(
    (state: RootState) => state.loading.checkingLoading
  );

  console.log({ checkingState });

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        <Header
          disableReturn
          helloLeftComponent={
            <View>
              <TextInter color={colors.dark[60]}>👋 Olá!</TextInter>
              <TextInter fontSize={23} weight="medium" color={colors.white[90]}>
                Fernanda
              </TextInter>
            </View>
          }
          navigation={navigation}
        />
        <Divider />
        <TextInter fontSize={19} weight="medium" color={colors.white[100]}>
          Selecione o que deseja fazer:
        </TextInter>
        <Divider height={28} />
        <FlatList
          data={[
            {
              title: "Caracterização Espeleológica",
              icon: <HatManIcon />,
              id: 1,
              onPress: () => navigation.navigate("CharacterizationScreen"),
            },
            {
              title: "Informações Topográficas",
              icon: <BookPenIcon disabled/>,
              id: 2,
              onPress: () => navigation.navigate(""),
            },
            {
              title: "Encontrar Ficha de Caracterização",
              icon: <PapersIcon disabled/>,
              id: 3,
              onPress: () => navigation.navigate(""),
            },
            {
              title: "Dashboard",
              icon: <PieChartIcon />,
              id: 4,
              onPress: () => navigation.navigate("Dashboard"),
            },
          ]}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <MenuCard
              icon={item.icon}
              title={item.title}
              onPress={item.onPress}
              disabled={item.id === 2 || item.id === 3}
            />
          )}
          ItemSeparatorComponent={({}) => <Divider height={16} />}
        />
        <CheckProjectsModal
          visible={checkingState}
          navigation={navigation}
          onClose={() => dispatch(setIsCheckingLoading(false))}
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
