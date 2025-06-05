import {
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";
import { Header } from "../../components/header";
import { colors } from "../../assets/colors";
import TextInter from "../../components/textInter";
import { Divider } from "../../components/divider";
import { BarChart, barDataItem } from "react-native-gifted-charts";
import { CavityCard } from "./components/cavityCard";
import { FC, useState, useEffect, useCallback } from "react";
import { RouterProps } from "../../types";
// import { DetailScreenCavity } from "../detailScreenCavity"; // Não usado diretamente aqui
import { FakeSearch } from "../../components/fakeSearch";
import { Q } from "@nozbe/watermelondb";
import { Subscription } from "rxjs";
import CavityRegister from "../../db/model/cavityRegister";
import { database } from "../../db";
import { useFocusEffect } from "@react-navigation/native";
import { FakeBottomTab } from "../../components/fakeBottomTab";

const getMonthAbbreviation = (monthIndex: number): string => {
  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  return months[monthIndex] || "N/A"; 
};

interface SelectedBarInfo {
  label: string;
  value: number;
}

export const CavityScreen: FC<RouterProps> = ({ navigation }) => {
  const screenWidth = Dimensions.get("window").width;
  const yAxisLabelWidth = 25; 
  const chartContainerPaddingHorizontal = 10;
  const chartWidth = screenWidth - (20 * 2) - (chartContainerPaddingHorizontal * 2) - yAxisLabelWidth - 15;

  const [latestCavities, setLatestCavities] = useState<CavityRegister[]>([]);
  const [isLoadingCavities, setIsLoadingCavities] = useState(true);
  const [chartData, setChartData] = useState<barDataItem[]>([]);
  const [chartDisplayMaxValue, setChartDisplayMaxValue] = useState(10); // Renomeado para clareza
  const [customYAxisLabels, setCustomYAxisLabels] = useState<string[]>([]); // Para labels personalizadas
  const [numberOfChartSections, setNumberOfChartSections] = useState(5); // Para noOfSections
  const [selectedBar, setSelectedBar] = useState<SelectedBarInfo | null>(null);
  const [dynamicBarWidth, setDynamicBarWidth] = useState(30);
  const [dynamicSpacing, setDynamicSpacing] = useState(15);
  // numberOfMonthsToShow não é mais necessário, pois é calculado e usado localmente em processChartData


  const fetchLatestCavities = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoadingCavities(true);
    }
    try {
      const cavityCollection = database.get<CavityRegister>("cavity_register");
      const fetchedCavities = await cavityCollection.query(Q.sortBy("data", Q.desc), Q.take(5)).fetch(); 
      setLatestCavities(fetchedCavities);
    } catch (error) {
      console.error("Error fetching cavities:", error);
    } finally {
      if (showLoading) {
        setIsLoadingCavities(false);
      }
    }
  }, []);

  const processChartData = useCallback(async () => {
    try {
      const cavityCollection = database.get<CavityRegister>("cavity_register");
      const allCavities = await cavityCollection.query().fetch();
      const now = new Date();
      
      const approximateBarSlotWidth = 60; 
      let calculatedMonths = Math.floor(chartWidth / approximateBarSlotWidth);
      calculatedMonths = Math.max(3, calculatedMonths); 
      calculatedMonths = Math.min(5, calculatedMonths); 
      // setNumberOfMonthsToShow(calculatedMonths); // Não é mais um estado, usado localmente

      const monthlyCounts: { [key: string]: number } = {};
      const monthLabels: { key: string; label: string }[] = [];

      for (let i = 0; i < calculatedMonths; i++) { 
        const dateIterator = new Date(now);
        dateIterator.setMonth(now.getMonth() - i); 
        const year = dateIterator.getFullYear();
        const month = dateIterator.getMonth();
        const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
        monthlyCounts[monthKey] = 0;
        monthLabels.push({ key: monthKey, label: getMonthAbbreviation(month) });
      }
      monthLabels.reverse();

      const earliestMonthDate = new Date(now);
      earliestMonthDate.setMonth(now.getMonth() - (calculatedMonths - 1)); 
      earliestMonthDate.setDate(1);
      earliestMonthDate.setHours(0, 0, 0, 0);

      const latestMonthDate = new Date(now);
      const tempDateForEndOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); 
      latestMonthDate.setDate(tempDateForEndOfMonth.getDate());
      latestMonthDate.setHours(23,59,59,999);

      allCavities.forEach((cavity) => {
        try {
          const dataString = String(cavity.data);
          const cavityDate = new Date(dataString);
          if (!isNaN(cavityDate.getTime())) {
            if (cavityDate >= earliestMonthDate && cavityDate <= latestMonthDate) {
              const cavityYear = cavityDate.getFullYear();
              const cavityMonth = cavityDate.getMonth();
              const monthKey = `${cavityYear}-${String(cavityMonth + 1).padStart(2, "0")}`;
              if (monthlyCounts.hasOwnProperty(monthKey)) {
                monthlyCounts[monthKey]++;
              }
            }
          }
        } catch (dateError) {
          console.warn(`Could not parse date for cavity ${cavity.id}: ${cavity.data}`, dateError);
        }
      });

      let maxCount = 0;
      const formattedChartData: barDataItem[] = monthLabels.map((monthInfo) => {
        const count = monthlyCounts[monthInfo.key] || 0;
        if (count > maxCount) maxCount = count;
        return {
          value: count,
          label: String(monthInfo.label),
          onPress: () => handleBarPress({ label: String(monthInfo.label), value: count }),
        };
      });
      
      // Lógica para labels do eixo Y e maxValue
      const numSections = 5; // Número desejado de seções/intervalos no eixo Y
      let stepForYLabels = 1; // Valor padrão do passo
      let displayMaxValue = numSections; // Valor máximo padrão para o eixo Y

      if (maxCount > 0) {
        stepForYLabels = Math.ceil(maxCount / numSections) || 1; // Garante que o passo seja pelo menos 1
        displayMaxValue = stepForYLabels * numSections;
      } else { // Se maxCount é 0, define um displayMaxValue razoável
        displayMaxValue = numSections; // Ex: 0, 1, 2, 3, 4, 5
        stepForYLabels = 1;
      }
       // Garante que displayMaxValue seja pelo menos `numSections` para ter um gráfico visível se maxCount for muito baixo
      if (maxCount > 0 && displayMaxValue < maxCount) {
        displayMaxValue = Math.ceil(maxCount / stepForYLabels) * stepForYLabels;
      }
      if (displayMaxValue === 0 && numSections > 0) { // Caso especial onde maxCount é 0
          displayMaxValue = numSections * stepForYLabels; // Ex: 5 se stepForYLabels for 1
      }


      const yLabels: string[] = [];
      for (let i = 0; i <= numSections; i++) {
        yLabels.push(String(i * stepForYLabels));
      }
      
      setCustomYAxisLabels(yLabels);
      setChartDisplayMaxValue(displayMaxValue);
      setNumberOfChartSections(numSections);


      if (calculatedMonths > 0) {
        const totalSpacingForBars = (calculatedMonths + 1) * 5; // Um pouco mais de espaçamento geral
        const availableWidthForBars = chartWidth - totalSpacingForBars - yAxisLabelWidth;
        let newBarWidth = Math.floor(availableWidthForBars / calculatedMonths);
        newBarWidth = Math.max(15, newBarWidth); 
        newBarWidth = Math.min(35, newBarWidth); 
        
        let newSpacing = Math.floor((chartWidth - (newBarWidth * calculatedMonths) - yAxisLabelWidth) / Math.max(1, calculatedMonths + 1));
        newSpacing = Math.max(5, newSpacing); 
        newSpacing = Math.min(20, newSpacing);

        setDynamicBarWidth(newBarWidth);
        setDynamicSpacing(newSpacing);
      }

      setChartData(formattedChartData);
    } catch (error) {
      console.error("Error processing chart data:", error);
      setChartData([]);
      setChartDisplayMaxValue(5); // Reset para default em caso de erro
      setCustomYAxisLabels(["0","1","2","3","4","5"]); // Reset para default
      setNumberOfChartSections(5);
    }
  }, [chartWidth, yAxisLabelWidth]); // Adicionado yAxisLabelWidth

  useEffect(() => {
    const cavityCollection = database.get<CavityRegister>("cavity_register");
    const query = cavityCollection.query(Q.sortBy("data", Q.desc), Q.take(5)); 
    const subscription: Subscription = query
      .observeWithColumns(["data", "nome_cavidade", "registro_id"])
      .subscribe({
        next: (updatedCavities) => {
          setLatestCavities(updatedCavities);
          processChartData(); 
        },
        error: (error) => console.error("Error observing list cavities:", error),
      });
    return () => subscription.unsubscribe();
  }, [processChartData]);

  useFocusEffect(
    useCallback(() => {
      fetchLatestCavities(true); 
      processChartData(); 
      setSelectedBar(null);
      return () => {};
    }, [fetchLatestCavities, processChartData])
  );

  const handleOpenDetail = useCallback((cavityId: string) => {
    navigation.navigate("DetailScreenCavity", { cavityId });
  }, [navigation]);

  const handleBarPress = useCallback((item: SelectedBarInfo) => {
    setSelectedBar((prev) =>
      prev?.label === String(item.label) && prev?.value === item.value ? null : { ...item, label: String(item.label) }
    );
  }, []);

  const renderEmptyList = () => (
    <View style={styles.emptyListContainer}>
      {isLoadingCavities ? (
        <ActivityIndicator size="large" color={colors.accent[100]} />
      ) : (
        <TextInter color={colors.dark[60]} style={{ textAlign: "center" }}>
          Nenhuma cavidade cadastrada ainda.
        </TextInter>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.main}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{flexGrow: 1}}>
        <View style={styles.container}>
              <Header
                title="Caracterização"
                navigation={navigation}
                onCustomReturn={() => navigation.navigate("HomeScreen")}
              />
              <Divider height={35} />
              <FakeSearch
                placeholder="Ficha de Caracterização"
                onPress={() => navigation.navigate("SearchCavity")}
              />
              <Divider height={24} />
              <TextInter fontSize={19} weight="medium" color={colors.white[100]}>
                Dashboard (Visão Geral)
              </TextInter>
              <Divider height={24} />
              <View style={styles.chartContainer}>
                {chartData.length > 0 ? (
                  <BarChart
                    barWidth={dynamicBarWidth} 
                    // stepValue é ignorado se yAxisLabelTexts for fornecido
                    isAnimated
                    height={165}
                    data={chartData}
                    spacing={dynamicSpacing} 
                    dashWidth={0} 
                    yAxisThickness={0} 
                    xAxisThickness={1.5}
                    xAxisColor={colors.dark[60]}
                    xAxisLabelsHeight={10}
                    xAxisLabelTextStyle={styles.axisLabel}
                    yAxisTextStyle={styles.axisLabel} // Estilo para as labels personalizadas
                    rulesColor={colors.dark[50]}
                    rulesType="solid"
                    noOfSections={numberOfChartSections} // Usar o estado para noOfSections
                    yAxisLabelWidth={yAxisLabelWidth}
                    maxValue={chartDisplayMaxValue} // Usar o estado para maxValue
                    yAxisLabelTexts={customYAxisLabels} // Fornecer labels personalizadas
                    frontColor={colors.accent[100]}
                    focusBarOnPress
                    focusedBarConfig={{ color: colors.opposite[100] }}
                  />
                ) : isLoadingCavities ? ( 
                  <ActivityIndicator color={colors.accent[100]} />
                ) : (
                  <TextInter color={colors.dark[60]}>Sem dados para o gráfico.</TextInter>
                )}
              </View>
              {selectedBar && (
                <View style={styles.selectedBarContainer}>
                  <TextInter color={colors.white[100]}>
                    {String(selectedBar.label)}: {selectedBar.value} cavidade(s)
                  </TextInter>
                </View>
              )}
              <Divider height={30} />
              <TextInter fontSize={19} weight="medium" color={colors.white[100]}>
                Últimas Cavidades
              </TextInter>
              <Divider height={24} />
              <View style={styles.flatListContainer}>
                <FlatList
                  data={latestCavities}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <CavityCard
                      cavity={item}
                      onPress={() => handleOpenDetail(item.id)}
                    />
                  )}
                  ItemSeparatorComponent={() => <Divider height={12} />}
                  ListEmptyComponent={renderEmptyList}
                  contentContainerStyle={styles.flatListContent}
                  scrollEnabled={false} 
                />
              </View>
        </View>
      </ScrollView>
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
    paddingBottom: 15 + (Platform.OS === "ios" ? 110 : 84), 
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.dark[80],
    width: "100%",
    height: 230,
    paddingHorizontal: 10, 
    paddingTop: 10, 
    borderRadius: 10,
    overflow: 'hidden', 
  },
  axisLabel: {
    color: colors.dark[60],
    fontWeight: "400",
    fontSize: 9,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  selectedBarContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  flatListContent: {},
  flatListContainer: {},
});

