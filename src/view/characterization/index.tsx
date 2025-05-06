import {
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  View,
  ActivityIndicator, // Import ActivityIndicator for loading
} from "react-native";
import { Header } from "../../components/header"; // Adjust path
import { colors } from "../../assets/colors"; // Adjust path
import TextInter from "../../components/textInter"; // Adjust path
import { Divider } from "../../components/divider"; // Adjust path
import { BarChart, barDataItem } from "react-native-gifted-charts";
import { CavityCard } from "./components/cavityCard"; // Adjust path
import { FC, useState, useEffect, useCallback } from "react"; // Import useEffect, useCallback
import { RouterProps } from "../../types"; // Adjust path
import { DetailScreen } from "./components/detailScreen"; // Adjust path
import { FakeSearch } from "../../components/fakeSearch"; // Adjust path

// --- WatermelonDB Imports ---
import { Q } from "@nozbe/watermelondb";
import { Subscription } from "rxjs";
import CavityRegister from "../../db/model/cavityRegister";
import { database } from "../../db";
import { useFocusEffect } from "@react-navigation/native";

const getMonthAbbreviation = (monthIndex: number): string => {
  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  return months[monthIndex] || "N/A";
};

interface SelectedBarInfo {
  label: string;
  value: number;
}

export const CharacterizationScreen: FC<RouterProps> = ({ navigation }) => {
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 115;

  const [detailIsVisible, setDetailIsVisible] = useState(false);
  const [selectedCavityId, setSelectedCavityId] = useState<string | null>(null);
  const [latestCavities, setLatestCavities] = useState<CavityRegister[]>([]);
  const [isLoadingCavities, setIsLoadingCavities] = useState(true);
  const [chartData, setChartData] = useState<barDataItem[]>([]);
  const [chartMaxValue, setChartMaxValue] = useState(10);
  const [selectedBar, setSelectedBar] = useState<SelectedBarInfo | null>(null);

  const fetchLatestCavities = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoadingCavities(true);
    }
    console.log("Fetching latest cavities...");
    try {
      const cavityCollection = database.get<CavityRegister>("cavity_register");
      const fetchedCavities = await cavityCollection
        .query(Q.sortBy("data", Q.desc), Q.take(10))
        .fetch();
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
    console.log("Processing chart data...");
    // Set a loading state specifically for the chart if needed
    // setIsLoadingChart(true);
    try {
      const cavityCollection = database.get<CavityRegister>("cavity_register");
      const allCavities = await cavityCollection.query().fetch();

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-11

      const monthlyCounts: { [key: string]: number } = {};
      const monthLabels: { key: string; label: string }[] = [];

      for (let i = 0; i <= 5; i++) {
          const dateIterator = new Date(now);
          dateIterator.setMonth(now.getMonth() - i);
          const year = dateIterator.getFullYear();
          const month = dateIterator.getMonth();
          const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
          monthlyCounts[monthKey] = 0;
          monthLabels.push({ key: monthKey, label: getMonthAbbreviation(month) });
      }
      monthLabels.reverse();

      const earliestMonthDate = new Date(now);
      earliestMonthDate.setMonth(now.getMonth() - 5);
      const earliestYear = earliestMonthDate.getFullYear();
      const earliestMonth = earliestMonthDate.getMonth();


      allCavities.forEach(cavity => {
        try {
          const dataString = String(cavity.data);
          const cavityDate = new Date(dataString);

          if (!isNaN(cavityDate.getTime())) {
            const cavityYear = cavityDate.getFullYear();
            const cavityMonth = cavityDate.getMonth();

            const isInRangeSameYear = cavityYear === currentYear && cavityMonth >= earliestMonth && cavityMonth <= currentMonth;
            const isInRangePrevYear = cavityYear === earliestYear && earliestYear < currentYear && cavityMonth >= earliestMonth;
            const isInRangeCurrentYearAfterWrap = cavityYear === currentYear && earliestYear < currentYear && cavityMonth <= currentMonth;


            if (isInRangeSameYear || isInRangePrevYear || isInRangeCurrentYearAfterWrap) {
                const monthKey = `${cavityYear}-${String(cavityMonth + 1).padStart(2, '0')}`;

                if (monthlyCounts.hasOwnProperty(monthKey)) {
                    monthlyCounts[monthKey]++;
                } else {
                    console.warn(`Month key ${monthKey} not found in initialized counts.`);
                }
            }
          }
        } catch (dateError) {
          console.warn(`Could not parse date for cavity ${cavity.id}: ${cavity.data}`, dateError);
        }
      });

      let maxCount = 0;
      const formattedChartData: barDataItem[] = monthLabels.map(monthInfo => {
        const count = monthlyCounts[monthInfo.key] || 0;
        if (count > maxCount) {
          maxCount = count;
        }
        return {
          value: count,
          label: monthInfo.label,
          onPress: () => handleBarPress({ label: monthInfo.label, value: count }),
        };
      });

      setChartData(formattedChartData);
      setChartMaxValue(maxCount < 4 ? 5 : maxCount + 1);
      console.log("Chart data processed:", formattedChartData, "Max Value:", chartMaxValue);

    } catch (error) {
      console.error("Error processing chart data:", error);
      setChartData([]);
      setChartMaxValue(5); // Reset to default on error
    } finally {
        // setIsLoadingChart(false);
    }
  }, []);

  useEffect(() => {
    console.log("Setting up observer for latest cavities list...");
    const cavityCollection = database.get<CavityRegister>("cavity_register");
    const query = cavityCollection.query(Q.sortBy("data", Q.desc), Q.take(10));
    const subscription: Subscription = query.observeWithColumns(['uploaded']).subscribe({
      next: (updatedCavities) => {
        console.log("List Observer triggered, updating cavities state.");
        setLatestCavities(updatedCavities);
      },
      error: (error) => console.error("Error observing list cavities:", error),
    });

    return () => {
      console.log("Unsubscribing from cavity list observer.");
      subscription.unsubscribe();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log("Screen focused, fetching data...");
      // Fetch data for the list (showLoading=true for initial focus load)
      fetchLatestCavities(true);
      // Fetch and process data for the chart
      processChartData();
      // Hide tooltip when screen focuses
      setSelectedBar(null);

      // Optional: Return a cleanup function if needed when screen blurs
      // return () => {
      //   console.log("Screen blurred");
      // };
    }, [fetchLatestCavities, processChartData]) // Dependencies for the focus effect
  );

  const handleOpenDetail = useCallback((cavityId: string) => {
    setSelectedCavityId(cavityId);
    setDetailIsVisible(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailIsVisible(false);
    setSelectedCavityId(null);
  }, []);

  const handleUploadComplete = useCallback(() => {
    console.log("Upload complete signal received. Refetching list and chart data...");
    fetchLatestCavities(false);
    processChartData();
    setSelectedBar(null);
  }, [fetchLatestCavities, processChartData]);

  const handleBarPress = useCallback((item: SelectedBarInfo) => {
      setSelectedBar(prev => (prev?.label === item.label && prev?.value === item.value ? null : item));
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
      <View style={styles.container}>
        {detailIsVisible && selectedCavityId ? (
          <DetailScreen
            cavityId={selectedCavityId}
            navigation={navigation}
            onClose={handleCloseDetail}
          />
        ) : (
          <>
            <Header
              uploadButton
              title="Caracterização"
              onCustomReturn={() => navigation.navigate("Tabs")}
              onUploadSuccess={handleUploadComplete}
            />
            <Divider height={35} />
            <FakeSearch
              placeholder="Ficha de Caracterização" // Improved placeholder
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
                barWidth={33}
                // --- Use stepValue instead of noOfSections ---
                stepValue={1} // Set step to 1 for integer labels
                // noOfSections={5} // Remove or comment out noOfSections
                // ---------------------------------------------
                isAnimated
                height={165}
                width={chartWidth}
                data={chartData} // Pass data with onPress handlers
                spacing={15}
                dashWidth={0.01}
                yAxisThickness={0}
                xAxisThickness={1.5}
                xAxisColor={colors.dark[60]}
                xAxisLabelsHeight={10}
                xAxisLabelTextStyle={styles.axisLabel}
                yAxisTextStyle={styles.axisLabel}
                rulesColor={colors.dark[50]}
                rulesType="solid"
                yAxisLabelWidth={25}
                maxValue={chartMaxValue} // Use dynamic max value (adjusted)
                frontColor={colors.accent[100]}
                focusBarOnPress // Enable focus on press
                focusedBarConfig={{ // Style for the focused bar
                    color: colors.opposite[100],
                }}
             />
              ) : (
                <ActivityIndicator color={colors.accent[100]} />
              )}
            </View>
            <Divider height={30} />
            <TextInter fontSize={19} weight="medium" color={colors.white[100]}>
              Últimas Cavidades
            </TextInter>
            <Divider height={24} />
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
              contentContainerStyle={
                latestCavities.length === 0
                  ? styles.emptyListContent
                  : undefined
              }
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
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
