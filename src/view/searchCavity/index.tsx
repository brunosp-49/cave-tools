import {
  ActivityIndicator,
  BackHandler,
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
import { CavityCard } from "../cavity/components/cavityCard";
import { Search } from "../../components/search";
import { useAppSelector } from "../../hook";
import { onChangeSearchCharacterization } from "../../redux/userSlice";
import { AppDispatch, RootState } from "../../redux/store";
import CavityRegister from "../../db/model/cavityRegister";
import { useDebounce } from "use-debounce";
import { database } from "../../db";
import { Q } from "@nozbe/watermelondb";
import { Subscription } from "rxjs";
import TextInter from "../../components/textInter";
import { DetailScreenCavity } from "../detailScreenCavity";
import { useFocusEffect } from "@react-navigation/native";

const SearchCavity: FC<RouterProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { searchCharacterization } = useSelector(
    (state: RootState) => state.user
  );

  // --- State ---
  const [searchResults, setSearchResults] = useState<CavityRegister[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedSearchTerm] = useDebounce(searchCharacterization, 300);
  const [allCavities, setAllCavities] = useState<CavityRegister[]>([]);

  const fetchAllCavities = useCallback(async () => {
    setIsSearching(true);
    try {
      const cavityCollection = database.get<CavityRegister>("cavity_register");
      const fetchedCavities = await cavityCollection
        .query(Q.sortBy("data", Q.desc))
        .fetch();
      setAllCavities(fetchedCavities);
      if (!debouncedSearchTerm) {
        setSearchResults(fetchedCavities);
      }
    } catch (error) {
      console.error("Error observing cavities:", error);
      setIsSearching(false);
    } finally {
      setIsSearching(false);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    fetchAllCavities();
  }, [fetchAllCavities]);

  useEffect(() => {
    const searchTerm = debouncedSearchTerm.trim();

    if (!searchTerm) {
      setSearchResults(allCavities);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const cavityCollection = database.get<CavityRegister>("cavity_register");
    const query = cavityCollection.query(
      Q.or(
        Q.where(
          "nome_cavidade",
          Q.like(`%${Q.sanitizeLikeString(searchTerm)}%`)
        ),
        Q.where("registro_id", Q.like(`%${Q.sanitizeLikeString(searchTerm)}%`))
        // Add more Q.where clauses inside Q.or() to search other fields
        // Q.where('municipio', Q.like(`%${Q.sanitizeLikeString(searchTerm)}%`))
      ),
      Q.sortBy("nome_cavidade", Q.asc) // Sort results alphabetically
      // Q.take(20) // Optionally limit results
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
  }, [debouncedSearchTerm, allCavities]);

  const handleOpenDetail = useCallback((cavityId: string) => {
    navigation.navigate("DetailScreenCavity", { cavityId });
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        dispatch(onChangeSearchCharacterization(""));
        navigation.navigate("CavityScreen");
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => {
        subscription.remove();
      };
    }, [navigation])
  );

  const handleReturn = useCallback(() => {
    dispatch(onChangeSearchCharacterization(""));
    navigation.navigate("CavityScreen");
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
    if (!debouncedSearchTerm && allCavities.length === 0) {
      return (
        <View style={styles.emptyListContainer}>
          <TextInter color={colors.dark[60]}>
            Nenhuma cavidade cadastrada.
          </TextInter>
        </View>
      );
    }
    if (!debouncedSearchTerm) {
      return (
        <View style={styles.emptyListContainer}>
          <TextInter color={colors.dark[60]}>
            Digite para pesquisar cavidades.
          </TextInter>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
            <Header
              title="Pesquisar Cavidades"
              navigation={navigation}
              onCustomReturn={handleReturn}
            />
            <Divider height={34} />
            <Search
              placeholder="Ficha de Caracterização" 
              autoFocus
              value={searchCharacterization}
              onChangeText={(text) =>
                dispatch(onChangeSearchCharacterization(text))
              }
            />
            <Divider height={16} />
            <FlatList
              data={searchResults}
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
                searchResults.length === 0 ? styles.emptyListContent : undefined
              }
              keyboardShouldPersistTaps="handled"
            />
      </View>
    </SafeAreaView>
  );
};

export default SearchCavity;

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
