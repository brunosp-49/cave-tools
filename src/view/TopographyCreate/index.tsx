import { FC, useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  BackHandler,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useRoute, RouteProp, useFocusEffect } from "@react-navigation/native";
import { RootState } from "../../redux/store";
import {
  resetTopographyState,
  updateCurrentStep,
  updateTopography as updateTopographySlice,
  updateCavityId,
} from "../../redux/topographySlice";
import { loadDrawingState, resetDrawingState } from "../../redux/drawingSlice";
import { SuccessModal } from "../../components/modal/successModal";
import {
  createTopographyDrawing,
  fetchTopographyDrawingById,
  updateTopography,
} from "../../db/controller";
import { showError } from "../../redux/loadingSlice";
import { DefaultTopographyModal } from "../../components/modal/defaultTopographyModal";
import StepOne from "./stepOne";
import StepTwo from "./stepTwo";
import StepThree from "./stepThree";
import { colors } from "../../assets/colors";
import { RouterProps, TopographyPoint, StepProps } from "../../types";
import TextInter from "../../components/textInter";

// Definindo os tipos para os parâmetros de navegação
type TopographyCreateRouteProp = RouteProp<
  { params?: { draftId?: string | null } },
  "params"
>;

const TopographyCreateScreen: FC<RouterProps> = ({ navigation }) => {
  const route = useRoute<TopographyCreateRouteProp>();
  const draftId = route.params?.draftId;

  const [isLoading, setIsLoading] = useState(!!draftId);
  const [successModal, setSuccessModal] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const dispatch = useDispatch();
  const { currentStep, cavity_id, dataLines, drawingState } = useSelector(
    (state: RootState) => ({
      currentStep: state.topography.currentStep,
      cavity_id: state.topography.cavity_id,
      dataLines: state.drawing.dataLines,
      drawingState: state.drawing,
    })
  );

  useEffect(() => {
    const loadDraft = async () => {
      if (draftId) {
        const draftRecord = await fetchTopographyDrawingById(draftId);
        if (draftRecord) {
          try {
            const savedState = JSON.parse(draftRecord.drawing_data);
            dispatch(updateCavityId(draftRecord.cavity_id));
            dispatch(loadDrawingState(savedState));
            dispatch(updateCurrentStep(2)); // Pula direto para a tela de desenho
          } catch (e) {
            Alert.alert(
              "Erro",
              "Não foi possível carregar os dados do rascunho."
            );
            navigation.goBack();
          }
        } else {
          Alert.alert("Erro", "Rascunho não encontrado.");
          navigation.goBack();
        }
        setIsLoading(false);
      }
    };

    loadDraft();
  }, [draftId, dispatch, navigation]);

  useEffect(() => {
    if (!drawingState) return;
    const topographyPointsToSave: TopographyPoint[] =
      drawingState.dataLines.map((line) => ({
        cavity_id: cavity_id || "",
        from: line.sourceData.refDe,
        to: line.sourceData.refPara,
        distance: line.sourceData.distancia,
        azimuth: line.sourceData.azimute,
        incline: line.sourceData.inclinacao,
        turnUp: line.sourceData.paraCima,
        turnDown: line.sourceData.paraBaixo,
        turnRight: line.sourceData.paraDireita,
        turnLeft: line.sourceData.paraEsquerda,
      }));
    dispatch(updateTopographySlice(topographyPointsToSave));
  }, [drawingState.dataLines, cavity_id, dispatch]);

  const handleBack = useCallback(() => {
    if (currentStep === 0) {
      navigation.goBack();
      dispatch(resetTopographyState());
      dispatch(resetDrawingState());
    } else if (currentStep === 2) {
      dispatch(resetTopographyState());
      dispatch(resetDrawingState());
      navigation.navigate("TopographyListScreen", {
        mode: draftId ? "edit" : "create",
      });
    } else {
      dispatch(updateCurrentStep(currentStep - 1));
    }
  }, [currentStep, navigation, dispatch]);

  const handleNext = useCallback(async () => {
    if (currentStep === 1 && !cavity_id) {
      Alert.alert(
        "Seleção Necessária",
        "Por favor, selecione uma cavidade para continuar."
      );
      return;
    }
    if (currentStep === 2) {
      if (drawingState.dataLines.length === 0) {
        Alert.alert(
          "Nenhum Ponto",
          "Adicione pelo menos um ponto topográfico para finalizar."
        );
        return;
      }
      setIsConfirmModalOpen(true);
    } else {
      dispatch(updateCurrentStep(currentStep + 1));
    }
  }, [currentStep, cavity_id, drawingState.dataLines.length, dispatch]);

  const handleSave = async (isDraft: boolean) => {
    if (!cavity_id) {
      Alert.alert(
        "Erro",
        "ID da cavidade não encontrado para salvar o desenho."
      );
      return;
    }
    setIsConfirmModalOpen(false);
    try {
      if (draftId) {
        await updateTopography(draftId, {
          drawing_data: JSON.stringify(drawingState),
          is_draft: isDraft,
        });
      } else {
        await createTopographyDrawing(drawingState, cavity_id, isDraft);
      }
      setSuccessModal(true);
    } catch (error) {
      console.error("Falha ao salvar:", error);
      dispatch(
        showError({
          title: "Erro ao Salvar",
          message: "Tente novamente mais tarde.",
        })
      );
    }
  };

  const handleSuccessModalClose = () => {
    navigation.goBack();
    setSuccessModal(false);
    dispatch(resetTopographyState());
    dispatch(resetDrawingState());
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => subscription.remove();
    }, [handleBack])
  );

  const stepProps: Omit<
    StepProps,
    "navigation" | "route" | "validationAttempted"
  > = {
    onNext: handleNext,
    onBack: handleBack,
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.main,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.accent[100]} />
        <TextInter color={colors.white[80]} style={{ marginTop: 10 }}>
          Carregando rascunho...
        </TextInter>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.main}>
      <View style={styles.stepContainer}>
        {currentStep === 0 && (
          <StepOne
            navigation={navigation}
            route={route}
            validationAttempted={false}
            {...stepProps}
          />
        )}
        {currentStep === 1 && (
          <StepTwo
            navigation={navigation}
            route={route}
            validationAttempted={false}
            {...stepProps}
          />
        )}
        {currentStep === 2 && (
          <StepThree
            navigation={navigation}
            route={route}
            validationAttempted={false}
            {...stepProps}
          />
        )}
      </View>

      <SuccessModal
        visible={successModal}
        title="Desenho Salvo!"
        message="Seu desenho topográfico foi salvo com sucesso."
        onPress={handleSuccessModalClose}
      />

      <DefaultTopographyModal
        isOpen={isConfirmModalOpen}
        title="Salvar Desenho Topográfico"
        message="Escolha como deseja salvá-lo."
        onClose={() => setIsConfirmModalOpen(false)}
        enableBackButton={true}
        onBack={() => setIsConfirmModalOpen(false)}
        titleButtonCancel="Salvar como Rascunho"
        onCancel={() => handleSave(true)}
        enableLongButton={true}
        titleButtonConfirm="Salvar e Finalizar"
        onConfirm={() => handleSave(false)}
      />
    </SafeAreaView>
  );
};

export default TopographyCreateScreen;

const styles = StyleSheet.create({
  main: {
    backgroundColor: colors.dark[90],
    flex: 1,
  },
  stepContainer: {
    flex: 1,
  },
  modalInputContainer: {
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  modalInputLabel: {
    color: colors.white[80],
    marginBottom: 8,
    fontSize: 14,
  },
  modalInput: {
    backgroundColor: colors.dark[80],
    color: colors.white[100],
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.dark[70],
  },
});
