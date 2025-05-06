import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../assets/colors";
import { useDispatch, useSelector } from "react-redux";
import { Header } from "../../components/header";
import { FC, useCallback, useEffect, useState } from "react";
import { RouterProps } from "../../types";
import { Divider } from "../../components/divider";
import { CavityCard } from "../characterization/components/cavityCard";
import { Search } from "../../components/search";
import { useAppSelector } from "../../hook";
import { onChangeSearchCharacterization } from "../../redux/userSlice";
import { AppDispatch, RootState } from "../../redux/store";
import CavityRegister from "../../db/model/cavityRegister";
import { useDebounce } from 'use-debounce';
import { database } from "../../db";
import { Q } from "@nozbe/watermelondb";
import { Subscription } from "rxjs";
import TextInter from "../../components/textInter";
import { DetailScreen } from "../characterization/components/detailScreen";

const SearchCavity: FC<RouterProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { searchCharacterization } = useSelector((state: RootState) => state.user); // Get search term from Redux

  // --- State ---
  const [searchResults, setSearchResults] = useState<CavityRegister[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [detailIsVisible, setDetailIsVisible] = useState(false);
  const [selectedCavityId, setSelectedCavityId] = useState<string | null>(null);
  const [debouncedSearchTerm] = useDebounce(searchCharacterization, 300);

  const getAllCavities = async()=>{
    setIsSearching(true);
    const cavityCollection = database.get<CavityRegister>('cavity_register');

    const query = cavityCollection.query(
      Q.sortBy('data', Q.desc),
      Q.take(10)
    );

    // Observe the query results
    const subscription: Subscription = query.observe().subscribe({
      next: (fetchedCavities) => {
        setSearchResults(fetchedCavities);
        setIsSearching(false);
      },
      error: (error) => {
        console.error("Error observing cavities:", error);
        setIsSearching(false);
        // Optionally show an error message to the user
      }
    });
  }

  useEffect(() => {
    getAllCavities();
  }, []);

  useEffect(() => {
    const searchTerm = debouncedSearchTerm.trim();

    if (!searchTerm) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const cavityCollection = database.get<CavityRegister>('cavity_register');
    const query = cavityCollection.query(
      Q.or(
        Q.where('nome_cavidade', Q.like(`%${Q.sanitizeLikeString(searchTerm)}%`)),
        Q.where('registro_id', Q.like(`%${Q.sanitizeLikeString(searchTerm)}%`))
        // Add more Q.where clauses inside Q.or() to search other fields
        // Q.where('municipio', Q.like(`%${Q.sanitizeLikeString(searchTerm)}%`))
      ),
      Q.sortBy('nome_cavidade', Q.asc) // Sort results alphabetically
      // Q.take(20) // Optionally limit results
    );

    // Observe the query
    const subscription: Subscription = query.observe().subscribe({
        next: (results) => {
            setSearchResults(results);
            setIsSearching(false); // Searching finished
        },
        error: (error) => {
            console.error("Error observing search results:", error);
            setIsSearching(false);
            setSearchResults([]); // Clear results on error
            // Optionally show error to user
        }
    });

    // Cleanup function to unsubscribe
    return () => {
      subscription.unsubscribe();
    };
  }, [debouncedSearchTerm]);

  const handleOpenDetail = useCallback((cavityId: string) => {
      setSelectedCavityId(cavityId);
      setDetailIsVisible(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
      setDetailIsVisible(false);
      setSelectedCavityId(null);
  }, []);

   const handleReturn = useCallback(() => {
      dispatch(onChangeSearchCharacterization(""));
      navigation.navigate("CharacterizationScreen");
   }, [dispatch, navigation]);

  const renderEmptyList = () => {
      if (isSearching) {
          return <ActivityIndicator style={styles.emptyListContainer} size="large" color={colors.accent[100]} />;
      }
      if (debouncedSearchTerm && searchResults.length === 0) {
         return (
             <View style={styles.emptyListContainer}>
                 <TextInter color={colors.dark[60]}>Nenhum resultado encontrado para "{debouncedSearchTerm}".</TextInter>
             </View>
         );
      }
      if (!debouncedSearchTerm) {
         return (
            <View style={styles.emptyListContainer}>
                <TextInter color={colors.dark[60]}>Digite para pesquisar cavidades.</TextInter>
            </View>
         )
      }
      return null;
  }

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.container}>
        {detailIsVisible && selectedCavityId ? (
            <DetailScreen
                navigation={navigation}
                onClose={handleCloseDetail}
                cavityId={selectedCavityId}
            />
        ) : (
            <>
                <Header
                  title="Pesquisar Cavidades"
                  navigation={navigation}
                  onCustomReturn={handleReturn} // Use custom return handler
                />
                <Divider height={34} />
                <Search
                  placeholder="Ficha de Caracterização" // More specific placeholder
                  autoFocus
                  value={searchCharacterization} // Controlled by Redux state
                  onChangeText={(text) => dispatch(onChangeSearchCharacterization(text))} // Update Redux state
                />
                <Divider height={16} />
                <FlatList
                  data={searchResults} // Use fetched results
                  keyExtractor={(item) => item.id} // Use WatermelonDB ID
                  renderItem={({ item }) => (
                    <CavityCard
                      cavity={item} // Pass WatermelonDB model instance
                      onPress={() => handleOpenDetail(item.id)} // Pass ID to handler
                    />
                  )}
                  ItemSeparatorComponent={() => <Divider height={12} />}
                  ListEmptyComponent={renderEmptyList} // Show message when no results/loading
                  contentContainerStyle={searchResults.length === 0 ? styles.emptyListContent : undefined}
                  // Add KeyboardAvoidingView/behavior if needed, especially around FlatList
                  keyboardShouldPersistTaps="handled" // Dismiss keyboard on tap outside input
                />
            </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default SearchCavity;

// --- Styles ---
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
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 50, // Or adjust as needed
    paddingHorizontal: 20, // Add padding for text centering
  },
  emptyListContent: {
    flexGrow: 1, // Ensure container grows if list is empty
    justifyContent: 'center', // Center the empty component vertically
  }
});