import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";
import { Header } from "../../components/header";
import { colors } from "../../assets/colors";
import TextInter from "../../components/textInter";
import { FC } from "react";
import { RouterProps } from "../../types";
import { MenuCard } from "../home/components/menuCard";
import { Divider } from "../../components/divider";
import { useDispatch } from "react-redux";
import { FakeBottomTab } from "../../components/fakeBottomTab";
import { updateMode } from "../../redux/topographySlice";

export const TopographyScreen: FC<RouterProps> = ({ navigation }) => {
  const dispatch = useDispatch();

  const changeScreen = (mode: string) => {
    dispatch(updateMode(mode))
    navigation.navigate('TopographyCreateScreen');
  }

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        <Header title="Topografia" navigation={navigation} onCustomReturn={() => navigation.goBack()} />
        <Divider height={50} />
        <TextInter fontSize={19} weight="medium" color={colors.white[100]}>
          Selecione o que deseja fazer
        </TextInter>
        <Divider height={10} />
        <FlatList
          data={[
            {
              title: "Inserir informações topográficas",
              icon: null,
              id: 1,
              onPress: () => changeScreen('create'),
              disabled: false,
            },
            {
              title: "Editar informações topográficas",
              icon: null,
              id: 2,
              onPress: () => changeScreen('edit'),
              disabled: true,
            },
            {
              title: "Visualizar informações topográficas",
              icon: null,
              id: 3,
              onPress: () => changeScreen('view'),
              disabled: false
            },
          ]}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <MenuCard
              icon={item.icon}
              title={item.title}
              onPress={item.onPress}
            />
          )}
          ItemSeparatorComponent={({ }) => <Divider height={16} />}
        />
      </View>
      <FakeBottomTab onPress={() => navigation.navigate("RegisterCavity")} />
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
