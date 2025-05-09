import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";
import { colors } from "../../assets/colors";
import { useDispatch, useSelector } from "react-redux";
import { Header } from "../../components/header";
import { FC, useCallback, useEffect, useState } from "react";
import { RouterProps } from "../../types";
import { Divider } from "../../components/divider";
import { Search } from "../../components/search";
import { onChangeSearchProjects } from "../../redux/userSlice";
import { AppDispatch, RootState } from "../../redux/store";
import { useDebounce } from "use-debounce";
import { database } from "../../db";
import { Q } from "@nozbe/watermelondb";
import { Subscription } from "rxjs";
import TextInter from "../../components/textInter";
import Project from "../../db/model/project";
import { ProjectCard } from "../project/components/projectCard";
import { DetailScreenProject } from "../project/components/detailScreenProject";

const SearchProject: FC<RouterProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { searchProjects } = useSelector((state: RootState) => state.user);

  // --- State ---
  const [searchResults, setSearchResults] = useState<Project[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [detailIsVisible, setDetailIsVisible] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [debouncedSearchTerm] = useDebounce(searchProjects, 300);
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  const fetchAllProjects = useCallback(async () => {
    setIsSearching(true);
    try {
      const projectCollection = database.get<Project>("project");
      const fetchedProjects = await projectCollection
        .query(Q.sortBy("inicio", Q.desc))
        .fetch();
      setAllProjects(fetchedProjects);
      if (!debouncedSearchTerm) {
        setSearchResults(fetchedProjects);
      }
    } catch (error) {
      console.error("Error fetching all projects:", error);
    } finally {
      setIsSearching(false);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    fetchAllProjects();
  }, [fetchAllProjects]);

  useEffect(() => {
    const searchTerm = debouncedSearchTerm.trim();

    if (!searchTerm) {
      setSearchResults(allProjects); // Show all projects when search term is empty
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const projectCollection = database.get<Project>("project");
    const query = projectCollection.query(
      Q.or(
        Q.where(
          "nome_projeto",
          Q.like(`%${Q.sanitizeLikeString(searchTerm)}%`)
        ),
        Q.where("_id", Q.like(`%${Q.sanitizeLikeString(searchTerm)}%`))
      ),
      Q.sortBy("nome_projeto", Q.asc)
    );

    const subscription: Subscription = query.observe().subscribe({
      next: (results) => {
        setSearchResults(results);
        setIsSearching(false);
      },
      error: (error) => {
        console.error("Error observing search results:", error);
        setIsSearching(false);
        setSearchResults([]);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [debouncedSearchTerm, allProjects]); // Add allProjects as a dependency

  const handleOpenDetail = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
    setDetailIsVisible(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailIsVisible(false);
    setSelectedProjectId(null);
  }, []);

  const handleReturn = useCallback(() => {
    dispatch(onChangeSearchProjects(""));
    navigation.navigate("ProjectScreen");
  }, [dispatch, navigation]);

  const renderEmptyList = () => {
    if (isSearching) {
      return (
        <ActivityIndicator
          style={styles.emptyListContainer}
          size="large"
          color={colors.accent[100]}
        />
      );
    }
    if (debouncedSearchTerm && searchResults.length === 0) {
      return (
        <View style={styles.emptyListContainer}>
          <TextInter color={colors.dark[60]}>
            Nenhum resultado encontrado para "{debouncedSearchTerm}".
          </TextInter>
        </View>
      );
    }
    if (!debouncedSearchTerm && allProjects.length === 0) {
      return (
        <View style={styles.emptyListContainer}>
          <TextInter color={colors.dark[60]}>
            Nenhum projeto cadastrado.
          </TextInter>
        </View>
      );
    }
    if (!debouncedSearchTerm) {
      return (
        <View style={styles.emptyListContainer}>
          <TextInter color={colors.dark[60]}>
            Digite para pesquisar projetos.
          </TextInter>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        {detailIsVisible && selectedProjectId ? (
          <DetailScreenProject
            navigation={navigation}
            onClose={handleCloseDetail}
            projectId={selectedProjectId}
          />
        ) : (
          <>
            <Header
              title="Pesquisar Projetos"
              navigation={navigation}
              onCustomReturn={handleReturn}
            />
            <Divider height={34} />
            <Search
              placeholder="Projetos"
              autoFocus
              value={searchProjects}
              onChangeText={(text) => dispatch(onChangeSearchProjects(text))}
            />
            <Divider height={16} />
            <FlatList
              data={searchResults}
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
                searchResults.length === 0 ? styles.emptyListContent : undefined
              }
              keyboardShouldPersistTaps="handled"
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default SearchProject;

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
  emptyListContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
});
