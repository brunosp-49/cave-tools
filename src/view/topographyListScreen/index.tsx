import React, { FC, useCallback, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFocusEffect, useRoute, RouteProp } from "@react-navigation/native";
import { fetchAllTopographyDrawingsWithCavity } from "../../db/controller";
import { colors } from "../../assets/colors";
import { Header } from "../../components/header";
import TextInter from "../../components/textInter";
import { LongButton } from "../../components/longButton";
import { Ionicons } from "@expo/vector-icons";
import { RouterProps } from "../../types";
import TopographyDrawing from "../../db/model/topography";
import CheckIcon from "../../components/icons/checkIcon";
import { Search } from "../../components/search";

type ListScreenRouteProp = RouteProp<
  { params?: { mode?: "view" | "edit" } },
  "params"
>;

type EnrichedDrawing = {
  drawing: TopographyDrawing;
  cavityName: string;
};

const TopographyListScreen: FC<RouterProps> = ({ navigation }) => {
  const route = useRoute<ListScreenRouteProp>();
  const mode = route.params?.mode || "view";

  const [isLoading, setIsLoading] = useState(true);
  const [allDrawings, setAllDrawings] = useState<EnrichedDrawing[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      const loadDrawings = async () => {
        setIsLoading(true);
        const enrichedData = await fetchAllTopographyDrawingsWithCavity();
        setAllDrawings(enrichedData);
        setIsLoading(false);
      };
      loadDrawings();
    }, [])
  );

  const filteredDrawings = useMemo(() => {
    if (!searchQuery) {
      return allDrawings;
    }
    return allDrawings.filter((item) =>
      item.cavityName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allDrawings, searchQuery]);

  const handleItemPress = (item: TopographyDrawing) => {
    if (mode === "view") {
      navigation.navigate("TopographyDetailScreen", { drawingId: item.id });
      return;
    }

    if (mode === "edit") {
      // Modificação: Permitir editar mesmo que não seja rascunho, mas que ainda não tenha sido enviado.
      if (item.is_draft && !item.uploaded) {
        navigation.navigate("TopographyCreateScreen", { draftId: item.id });
      } else {
        Alert.alert(
          "Desenho não editavel",
          "Não é possível editar um desenho que já foi finalizado ou enviado para a nuvem."
        );
      }
    }
  };

  const renderItem = ({ item }: { item: EnrichedDrawing }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleItemPress(item.drawing)}
    >
      <View style={styles.itemIcon}>
        {item.drawing.is_draft ? (
          <Ionicons
            name="document-text-outline"
            size={24}
            color={colors.warning[100]}
          />
        ) : (
          <Ionicons
            name="lock-closed-outline"
            size={24}
            color={colors.accent[100]}
          />
        )}
      </View>
      <View style={styles.itemTextContainer}>
        {/* Agora exibe o nome da cavidade */}
        <TextInter weight="bold" color={colors.white[100]}>
          {item.cavityName}
        </TextInter>
        <View style={styles.itemSubtitleContainer}>
          <TextInter fontSize={12} color={colors.white[80]}>
            {`Criado em: ${new Date(item.drawing.date).toLocaleDateString()}`}
          </TextInter>
          <View style={styles.statusContainer}>
            <Ionicons
              name={
                item.drawing.is_draft
                  ? "create-outline"
                  : "checkmark-done-outline"
              }
              size={14}
              color={
                item.drawing.is_draft
                  ? colors.warning[100]
                  : colors.success[100]
              }
            />
            <TextInter
              fontSize={12}
              color={
                item.drawing.is_draft
                  ? colors.warning[100]
                  : colors.success[100]
              }
              style={{ marginLeft: 4 }}
            >
              {item.drawing.is_draft ? "Rascunho" : "Finalizado"}
            </TextInter>
          </View>
        </View>
      </View>
      <View style={styles.uploadStatusIcon}>
        {item.drawing.uploaded && <CheckIcon />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ paddingHorizontal: 20 }}>
        <Header
          title="Topografias Salvas"
          navigation={navigation}
          onCustomReturn={() => navigation.navigate("TopographyScreen")}
        />
      </View>
      <View style={styles.searchContainer}>
        <Search
          placeholder="Buscar pelo nome da cavidade..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator
          style={{ marginTop: 20 }}
          size="large"
          color={colors.accent[100]}
        />
      ) : (
        <FlatList
          data={filteredDrawings} // Usa a lista filtrada
          renderItem={renderItem}
          keyExtractor={(item) => item.drawing.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <TextInter color={colors.white[80]}>
                {searchQuery
                  ? "Nenhum resultado encontrado."
                  : "Nenhum desenho encontrado."}
              </TextInter>
            </View>
          }
        />
      )}

      <View style={styles.footer}>
        <LongButton
          title="Criar Nova Topografia"
          onPress={() =>
            navigation.navigate("TopographyCreateScreen", { draftId: null })
          }
          leftIcon={<Ionicons name="add" size={24} color={colors.white[100]} />}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark[90],
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    marginTop: 40,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: colors.white[100],
    fontSize: 16,
  },
  listContent: {
    padding: 20,
    flexGrow: 1,
  },
  itemContainer: {
    backgroundColor: colors.dark[80],
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  itemIcon: {
    marginRight: 15,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemSubtitleContainer: {
    // Novo container para alinhar os textos de baixo
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12, // Espaço entre a data e o status
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: colors.dark[70],
  },
  uploadStatusIcon: {
    // Estilo para o ícone de nuvem
    marginLeft: 10,
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.dark[70],
  },
});

export default TopographyListScreen;
