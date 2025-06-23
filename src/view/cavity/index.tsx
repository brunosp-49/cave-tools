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
      const fetchedCavities = await cavityCollection.query(Q.sortBy("data", Q.desc)).fetch(); 
      console.log({fetchLatestCavities});
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
      const now = new Date(); // Current date, e.g., June 5th, 2025

      const approximateBarSlotWidth = 60;
      let calculatedMonths = Math.floor(chartWidth / approximateBarSlotWidth);
      calculatedMonths = Math.max(3, calculatedMonths); // Show at least 3 months
      calculatedMonths = Math.min(5, calculatedMonths); // Show at most 5 months

      const monthlyCounts: { [key: string]: number } = {};
      const monthLabels: { key: string; label: string }[] = [];

      // Initialize monthlyCounts and monthLabels for the last `calculatedMonths`
      for (let i = 0; i < calculatedMonths; i++) {
        const dateIterator = new Date(now);
        dateIterator.setMonth(now.getMonth() - i); // Go back i months
        const year = dateIterator.getFullYear();
        const month = dateIterator.getMonth(); // 0-indexed
        const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`; // YYYY-MM
        monthlyCounts[monthKey] = 0;
        monthLabels.push({ key: monthKey, label: getMonthAbbreviation(month) });
      }
      monthLabels.reverse(); // Order from oldest to newest

      // Determine the date range for filtering cavities
      const earliestMonthDate = new Date(now);
      earliestMonthDate.setMonth(now.getMonth() - (calculatedMonths - 1)); // Start of the oldest month in range
      earliestMonthDate.setDate(1);
      earliestMonthDate.setHours(0, 0, 0, 0);

      const latestMonthDate = new Date(now); // End of the current month
      const tempDateForEndOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
      latestMonthDate.setDate(tempDateForEndOfMonth.getDate());
      latestMonthDate.setHours(23, 59, 59, 999);

      allCavities.forEach((cavity) => {
        try {
          const dataString = String(cavity.data); // e.g., "05/06/2025"
          const parts = dataString.split('/');

          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10); // 1-indexed month from string
            const year = parseInt(parts[2], 10);

            // Validate parsed components before creating a Date object
            if (!isNaN(day) && !isNaN(month) && !isNaN(year) &&
                month >= 1 && month <= 12 && day >= 1 && day <= 31) { // Basic validation

              // Create Date object (month is 0-indexed here)
              const cavityDate = new Date(year, month - 1, day);

              // Further validation: ensure the Date object correctly represents the parsed components
              // This catches cases like "31/02/2025" which new Date() might roll over.
              if (!isNaN(cavityDate.getTime()) &&
                  cavityDate.getFullYear() === year &&
                  cavityDate.getMonth() === month - 1 && // Compare with 0-indexed month
                  cavityDate.getDate() === day) {

                // Check if the valid cavityDate falls within our chart's date range
                if (cavityDate >= earliestMonthDate && cavityDate <= latestMonthDate) {
                  const cavityYear = cavityDate.getFullYear();
                  const cavityMonth = cavityDate.getMonth(); // 0-indexed
                  const monthKey = `${cavityYear}-${String(cavityMonth + 1).padStart(2, "0")}`; // YYYY-MM
                  if (monthlyCounts.hasOwnProperty(monthKey)) {
                    monthlyCounts[monthKey]++;
                  }
                }
              } else {
                console.warn(`Invalid calendar date constructed for cavity ${cavity.id}: ${dataString} (parsed as ${day}/${month}/${year})`);
              }
            } else {
              console.warn(`Invalid date components parsed for cavity ${cavity.id}: ${dataString}`);
            }
          } else {
            console.warn(`Unexpected date format for cavity ${cavity.id}: ${dataString}`);
          }
        } catch (dateError) {
          // Catch any other errors during date processing for a specific cavity
          console.warn(`Error processing date for cavity ${cavity.id}: ${cavity.data}`, dateError);
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

      const numSections = 5;
      let stepForYLabels = 1;
      let displayMaxValue = numSections;

      if (maxCount > 0) {
        stepForYLabels = Math.ceil(maxCount / numSections) || 1;
        displayMaxValue = stepForYLabels * numSections;
        if (displayMaxValue < maxCount) { // Ensure maxValue is at least maxCount
            displayMaxValue = Math.ceil(maxCount / stepForYLabels) * stepForYLabels;
        }
      } else { // If maxCount is 0
        displayMaxValue = numSections; // e.g., 0, 1, 2, 3, 4, 5
        stepForYLabels = 1;
      }
      // Ensure displayMaxValue is not 0 if there are sections
      if (displayMaxValue === 0 && numSections > 0) {
         displayMaxValue = numSections * stepForYLabels;
      }


      const yLabels: string[] = [];
      for (let i = 0; i <= numSections; i++) {
        yLabels.push(String(i * stepForYLabels));
      }

      setCustomYAxisLabels(yLabels);
      setChartDisplayMaxValue(displayMaxValue);
      setNumberOfChartSections(numSections);

      if (calculatedMonths > 0) {
        const totalSpacingForBars = (calculatedMonths + 1) * 5;
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
      setChartDisplayMaxValue(5);
      setCustomYAxisLabels(["0", "1", "2", "3", "4", "5"]);
      setNumberOfChartSections(5);
    }
  }, [chartWidth, yAxisLabelWidth]); 

  useEffect(() => {
    const cavityCollection = database.get<CavityRegister>("cavity_register");
    const query = cavityCollection.query(Q.sortBy("data", Q.desc), Q.take(5)); 
    const subscription: Subscription = query
      .observeWithColumns(["data", "nome_cavidade", "registro_id"])
      .subscribe({
        next: (updatedCavities) => {
          console.log({updatedCavities})
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
                      onPress={() => handleOpenDetail(item.cavidade_id)}
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

