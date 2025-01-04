import {
  Dimensions,
  FlatList,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";
import { Header } from "../../components/header";
import { colors } from "../../assets/colors";
import TextInter from "../../components/textInter";
import { Search } from "../../components/search";
import { Divider } from "../../components/divider";
import { BarChart } from "react-native-gifted-charts";
import { CavityCard } from "./components/cavityCard";
import { FC, useState } from "react";
import { RouterProps } from "../../types";
import { DetailScreen } from "./components/detailScreen";
import { FakeSearch } from "../../components/fakeSearch";

export const HomeScreen: FC<RouterProps> = ({ navigation }) => {
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 115;
  const [detailIsVisible, setDetailIsVisible] = useState(false);
  const barData = [
    {
      stacks: [
        { value: 70, color: colors.accent[100] },
        { value: 130, color: colors.dark[50] },
      ],
      label: "Jul",
    },
    {
      stacks: [
        { value: 148, color: colors.accent[100] },
        { value: 52, color: colors.dark[50] },
      ],
      label: "Ago",
    },
    {
      stacks: [
        { value: 110, color: colors.accent[100] },
        { value: 90, color: colors.dark[50] },
      ],
      label: "Set",
    },
    {
      stacks: [
        { value: 98, color: colors.accent[100] },
        { value: 102, color: colors.dark[50] },
      ],
      label: "Out",
    },
    {
      stacks: [
        { value: 160, color: colors.accent[100] },
        { value: 40, color: colors.dark[50] },
      ],
      label: "Nov",
    },
    {
      stacks: [
        { value: 125, color: colors.accent[100] },
        { value: 75, color: colors.dark[50] },
      ],
      label: "Dez",
    },
  ];
  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        {detailIsVisible ? (
          <DetailScreen
            navigation={navigation}
            onClose={() => setDetailIsVisible(false)}
          />
        ) : (
          <>
            <Header
              disableReturn
              helloLeftComponent={
                <View>
                  <TextInter color={colors.dark[60]}>👋 Olá!</TextInter>
                  <TextInter
                    fontSize={23}
                    weight="medium"
                    color={colors.white[90]}
                  >
                    Fernanda
                  </TextInter>
                </View>
              }
              navigation={navigation}
            />
            <Divider />
            <FakeSearch
              placeholder="Ficha de Caracterização"
              onPress={() => navigation.navigate("SearchCavity")}
            />
            <Divider height={8} />
            <TextInter fontSize={19} weight="medium" color={colors.white[100]}>
              Dashboard
            </TextInter>
            <Divider height={16} />
            <View style={styles.chartContainer}>
              <BarChart
                barWidth={33}
                noOfSections={5}
                isAnimated
                height={165}
                width={chartWidth}
                frontColor={colors.accent[100]}
                stackData={barData}
                spacing={15}
                dashWidth={0.01}
                yAxisThickness={0}
                xAxisThickness={1.5}
                xAxisColor={colors.dark[60]}
                xAxisLabelsHeight={10}
                xAxisLabelTextStyle={{
                  color: colors.dark[60],
                  fontWeight: "400",
                  fontSize: 9,
                }}
                yAxisTextStyle={{
                  color: colors.dark[60],
                  fontWeight: "400",
                  fontSize: 9,
                }}
                rulesColor={colors.dark[50]}
                rulesType="solid"
                yAxisLabelWidth={25}
                maxValue={200}
              />
            </View>
            <Divider height={20} />
            <TextInter fontSize={19} weight="medium" color={colors.white[100]}>
              Últimas Cavidades
            </TextInter>
            <Divider height={16} />
            <FlatList
              data={[
                { name: "Caverna Azul", date: String(new Date()), id: 1 },
                { name: "Caverna Verde", date: String(new Date()), id: 2 },
                { name: "Caverna Rochosa", date: String(new Date()), id: 3 },
              ]}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <CavityCard
                  cavity={item}
                  onPress={() => setDetailIsVisible(true)}
                />
              )}
              ItemSeparatorComponent={({}) => <Divider height={12} />}
            />
          </>
        )}
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
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.dark[80],
    width: "100%",
    height: 230,
    paddingLeft: 14,
    borderRadius: 10,
  },
});
