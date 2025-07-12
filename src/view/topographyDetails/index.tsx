// Em src/screens/topography/detail/TopographyDetailScreen.tsx
import React, { FC, useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import {
  deletePendingTopography,
  fetchTopographyDrawingById,
} from "../../db/controller";
import { TopographyCanvas } from "../../components/topography/topographyCanvas";
import { Header } from "../../components/header";
import { colors } from "../../assets/colors";
import { loadDrawingState, resetDrawingState } from "../../redux/drawingSlice";
import TextInter from "../../components/textInter";
import { RouterProps } from "../../types";
import TopoInfoModal from "../../components/topography/components/topoInfoModal";
import { LongButton } from "../../components/longButton";
import { ReturnButton } from "../../components/button/returnButton";
import { Ionicons } from "@expo/vector-icons";

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
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);
  const [isUploaded, setIsUploaded] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadDrawing = async () => {
        if (!drawingId) {
          setError("ID do desenho não fornecido.");
          setIsLoading(false);
          return;
        }

        const drawingRecord = await fetchTopographyDrawingById(drawingId);

        if (isActive) {
          if (drawingRecord) {
            try {
              setIsUploaded(drawingRecord.uploaded);
              const savedState = JSON.parse(drawingRecord.drawing_data);
              dispatch(loadDrawingState(savedState));
            } catch (e) {
              setError("Erro ao carregar dados do desenho.");
            }
          } else {
            setError("Desenho não encontrado.");
          }
          setIsLoading(false);
        }
      };

      loadDrawing();

      // A função de limpeza é retornada e executada quando a tela perde o foco
      return () => {
        isActive = false;
        console.log(
          "[DetailScreen] Saindo da tela, resetando estado do desenho."
        );
        dispatch(resetDrawingState());
      };
    }, [drawingId, dispatch])
  );

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
        <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
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

  const deleteTopography = async () => {
    Alert.alert(
      "Tem certeza que deseja excluir esta topografia?",
      "As alterações não poderão ser desfeitas.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            await deletePendingTopography(drawingId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <Header
          title="Detalhes"
          navigation={navigation}
          onCustomReturn={() => navigation.navigate("TopographyListScreen")}
        />
      </View>
      <TopographyCanvas isReadOnly={true} />
      <TopoInfoModal
        isReadOnly
        visible={isInfoModalVisible}
        onClose={() => setInfoModalVisible(false)}
      />
      <View
        style={
          isUploaded !== true
            ? styles.buttonContainerTwoButtons
            : styles.buttonContainer
        }
      >
        {isUploaded !== true && (
          <LongButton
            title="Excluir"
            onPress={deleteTopography}
            mode="delete"
            numberOfButtons={2}
          />
        )}
        <LongButton
          title="Ver Pontos"
          numberOfButtons={isUploaded !== true ? 2 : 1}
          onPress={() => setInfoModalVisible(true)}
          leftIcon={
            <Ionicons name="list" size={24} color={colors.white[100]} />
          }
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.dark[70],
    backgroundColor: colors.dark[90],
    gap: 10,
  },
  buttonContainerTwoButtons: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.dark[70],
    backgroundColor: colors.dark[90],
    gap: 10,
  },
});

export default TopographyDetailScreen;
