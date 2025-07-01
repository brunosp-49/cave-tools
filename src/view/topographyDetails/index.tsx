import React, { FC, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { fetchTopographyDrawingById } from "../../db/controller";
import { TopographyCanvas } from "../../components/topography/topographyCanvas";
import { Header } from "../../components/header";
import { colors } from "../../assets/colors";
import { loadDrawingState, resetDrawingState } from "../../redux/drawingSlice";
import TextInter from "../../components/textInter";
import { RouterProps } from "../../types";

// Definindo o tipo para os parâmetros de navegação
type DetailScreenRouteProp = RouteProp<
  { params: { drawingId: string } },
  "params"
>;

const TopographyDetailScreen: FC<RouterProps> = ({ navigation }) => {
  const route = useRoute<DetailScreenRouteProp>();
  const { drawingId } = route.params;
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDrawing = async () => {
      if (!drawingId) {
        setError("ID do desenho não fornecido.");
        setIsLoading(false);
        return;
      }

      const drawingRecord = await fetchTopographyDrawingById(drawingId);

      if (drawingRecord) {
        try {
          const savedState = JSON.parse(drawingRecord.drawing_data);
          dispatch(loadDrawingState(savedState));
        } catch (e) {
          setError("Erro ao carregar dados do desenho.");
        }
      } else {
        setError("Desenho não encontrado.");
      }
      setIsLoading(false);
    };

    loadDrawing();

    // Função de limpeza: reseta o estado do desenho ao sair da tela
    return () => {
      dispatch(resetDrawingState());
    };
  }, [drawingId, dispatch]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.accent[100]} />
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ paddingBottom: 12, paddingHorizontal: 20 }}>
          <Header
            title="Erro"
            navigation={navigation}
            onCustomReturn={() => navigation.navigate("TopographyListScreen")}
          />
        </View>
        <View style={styles.center}>
          <TextInter color={colors.error[100]}>{error}</TextInter>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ paddingBottom: 12, paddingHorizontal: 20 }}>
        <Header
          title="Detalhes"
          navigation={navigation}
          onCustomReturn={() => navigation.navigate("TopographyListScreen")}
        />
      </View>
      <TopographyCanvas isReadOnly={true} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark[90],
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TopographyDetailScreen;
