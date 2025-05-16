import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
  ScrollView, // Import ActivityIndicator for loading
} from "react-native";
import { Header } from "../../components/header"; // Adjust path
import { colors } from "../../assets/colors"; // Adjust path
import TextInter from "../../components/textInter"; // Adjust path
import { Divider } from "../../components/divider"; // Adjust path
import { FC, useState, useEffect, useCallback } from "react"; // Import useEffect, useCallback
import { RouterProps } from "../../types"; // Adjust path
import { DetailScreenProject } from "../detailScreenProject"; // Adjust path
import { FakeSearch } from "../../components/fakeSearch"; // Adjust path

// --- WatermelonDB Imports ---
import { Q } from "@nozbe/watermelondb";
import { Subscription } from "rxjs";
import { database } from "../../db";
import { useFocusEffect } from "@react-navigation/native";
import { ProjectCard } from "./components/projectCard";
import Project from "../../db/model/project";
import { FakeBottomTab } from "../../components/fakeBottomTab";

export const ProjectScreen: FC<RouterProps> = ({ navigation }) => {
  const [latestCavities, setLatestCavities] = useState<Project[]>([]);
  const [isLoadingCavities, setIsLoadingCavities] = useState(true);

  const fetchLatestCavities = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoadingCavities(true);
    }
    console.log("Fetching latest projects...");
    try {
      const projectCollection = database.collections.get<Project>("project");
      const fetchedCavities = await projectCollection
        .query(Q.sortBy("inicio", Q.desc), Q.take(10))
        .fetch();
      setLatestCavities(fetchedCavities);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      if (showLoading) {
        setIsLoadingCavities(false);
      }
    }
  }, []);

  useEffect(() => {
    console.log("Setting up observer for latest cavities list...");
    const projectCollection = database.collections.get<Project>("project");
    const query = projectCollection.query(
      Q.sortBy("inicio", Q.desc),
      Q.take(10)
    );
    const subscription: Subscription = query
      .observeWithColumns(["uploaded"])
      .subscribe({
        next: (updatedCavities) => {
          console.log("List Observer triggered, updating cavities state.");
        },
        error: (error) =>
          console.error("Error observing list cavities:", error),
      });

    return () => {
      console.log("Unsubscribing from project list observer.");
      subscription.unsubscribe();
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log("Screen focused, fetching data...");
      fetchLatestCavities(true);

      // Optional: Return a cleanup function if needed when screen blurs
      // return () => {
      //   console.log("Screen blurred");
      // };
    }, [fetchLatestCavities])
  );

  const handleOpenDetail = useCallback((projectId: string) => {
    navigation.navigate("DetailScreenProject", { projectId });
  }, []);

  const renderEmptyList = () => (
    <View style={styles.emptyListContainer}>
      {isLoadingCavities ? (
        <ActivityIndicator size="large" color={colors.accent[100]} />
      ) : (
        <TextInter color={colors.dark[60]} style={{ textAlign: "center" }}>
          Nenhum projeto cadastrado ainda.
        </TextInter>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.main}>
      <ScrollView>
        <View style={styles.container}>
          <Header
            title="Projetos"
            onCustomReturn={() => navigation.navigate("HomeScreen")}
            navigation={navigation}
            
          />
          <Divider height={35} />
          <FakeSearch
            placeholder="Projetos"
            onPress={() => navigation.navigate("SearchProject")}
          />
          <Divider height={30} />
          <TextInter fontSize={19} weight="medium" color={colors.white[100]}>
            Últimos Projetos
          </TextInter>
          <Divider height={24} />
          <FlatList
            data={latestCavities}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProjectCard
                project={item}
                onPress={() => handleOpenDetail(item.id)}
              />
            )}
            ItemSeparatorComponent={() => <Divider height={12} />}
            ListEmptyComponent={renderEmptyList}
            contentContainerStyle={
              latestCavities.length === 0 ? styles.emptyListContent : undefined
            }
          />
        </View>
      </ScrollView>
      <FakeBottomTab onPress={() => navigation.navigate("RegisterProject")} />
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
    paddingBottom: 15 + Platform.OS === "ios" ? 110 : 84,
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
