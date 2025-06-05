import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RouterProps, TopographyPoint, type TopographyData } from "../../types";
import { SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, BackHandler, Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { colors } from "../../assets/colors";
import { Header } from "../../components/header";
import { RootState } from "../../redux/store";
import { resetTopographyState, updateCurrentStep } from "../../redux/topographySlice";
import TextInter from "../../components/textInter";
import { ReturnButton } from "../../components/button/returnButton";
import { NextButton } from "../../components/button/nextButton";
import { SuccessModal } from "../../components/modal/successModal";
import { useFocusEffect } from "@react-navigation/native";
import StepOne from "./stepOne";
import StepTwo from "./stepTwo";
import { FakeBottomTab } from "../../components/fakeBottomTab";
import StepThree from "./stepThree";
import StepFour from "./stepFour";
import { createTopography } from "../../db/controller";
import uuid from "react-native-uuid";
import { showError } from "../../redux/loadingSlice";
import { DefaultTopographyModal } from "../../components/modal/defaultTopographyModal";

export interface StepComponentProps extends RouterProps {
  validationAttempted: boolean;
}

const validateStep = (
  stepIndex: number,
  data: TopographyPoint[]
): boolean => {
  if (!data) return false;

  return true;
}

const TopographyCreateScreen: FC<RouterProps> = ({ navigation, route }) => {
  const [editingTopography, setEditingTopography] = useState(true);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [successSuccessModal, setSuccessModal] = useState(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const {
    currentStep,
    formData,
    cavity_id
  } = useSelector((state: RootState) => ({
    currentStep: state.topography.currentStep,
    formData: state.topography.topography,
    cavity_id: state.topography.cavity_id,
  }));

  const dispatch = useDispatch();
  const scrollViewRef = useRef<ScrollView>(null);

  const handleBack = () => {
    setValidationAttempted(false);
    if (currentStep === 0) {
      navigation.navigate("TopographyScreen");
      dispatch(resetTopographyState());
    } else {
      dispatch(updateCurrentStep(currentStep - 1));
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
    }
  };

  const handleNext = async () => {
    setValidationAttempted(false); // Resetar se for válido

    const isValidOnClick = validateStep(currentStep, formData);

    if (!isValidOnClick) {
      Alert.alert(
        "Campos Obrigatórios",
        "Por favor, preencha todos os campos obrigatórios corretamente antes de continuar."
      );
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
      return;
    }

    if (currentStep === 0) {
      if (formData.length == 0) {
        Alert.alert(
          "Crie uma topografia",
          "Por favor, Preencha ao menos 1 topografia."
        );
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
        return;
      }
    }

    if (currentStep === steps.length - 1) {
      setIsOpenConfirmModal(!isOpenConfirmModal)
    } else {
      dispatch(updateCurrentStep(currentStep + 1));
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    }
  }

  const steps: FC<StepComponentProps>[] = [
    StepOne as FC<StepComponentProps>,
    StepTwo as FC<StepComponentProps>,
    StepThree as FC<StepComponentProps>,
    StepFour as FC<StepComponentProps>,
  ]

  const StepComponent: FC<StepComponentProps> = steps[currentStep];

  const isCurrentStepValid = useMemo(
    () => validateStep(currentStep, formData),
    [currentStep, formData]
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("TopographyScreen");
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

  const handleSuccessModalClose = () => {
    navigation.navigate("TopographyScreen");
    setSuccessModal(false);
    setIsOpenConfirmModal(false)
    dispatch(updateCurrentStep(0));
    dispatch(resetTopographyState());
  };

  const handleCreateTopography = async () => {
    try {
      const data = formData.map((topo: TopographyPoint) => ({
        registro_id: uuid.v4().toString(),
        cavity_id: cavity_id,
        data: new Date().toISOString(),
        azimuth: topo.azimuth,
        distance: topo.distance,
        from: topo.from,
        incline: topo.incline,
        to: topo.to,
        turnDown: topo.turnDown,
        turnLeft: topo.turnLeft,
        turnRight: topo.turnRight,
        turnUp: topo.turnUp,
      }))
      await createTopography(data);
      setSuccessModal(!successSuccessModal);
    } catch (error) {
      console.error("Error creating topography register:", error);
      dispatch(
        showError({
          title: "Erro ao criar topography",
          message:
            error instanceof Error
              ? error.message
              : "Confirme as informações e tente novamente.",
        })
      );
    }
  }

  return (
    <SafeAreaView style={styles.main}>
      <KeyboardAvoidingView
        style={styles.main}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Header title="Topografia" onCustomReturn={handleBack} />
          <View style={styles.stepContainer}>
            {StepComponent ? (
              <StepComponent
                navigation={navigation}
                route={undefined}
                validationAttempted={validationAttempted}
              />
            ) : (
              <TextInter>Carregando etapa...</TextInter>
            )}
          </View>

          {currentStep !== 1 && (
            <View style={styles.buttonContainer}>
              <ReturnButton buttonTitle={currentStep == 0 ? 'Limpar' : 'Voltar'} onPress={handleBack} />
              <NextButton
                onPress={handleNext}
                disabled={validationAttempted && !isCurrentStepValid}
                buttonTitle={
                  currentStep === steps.length - 1
                    ? "Finalizar"
                    : currentStep == 0 ? 'Aplicar' : "Continuar"
                }
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <FakeBottomTab onPress={() => navigation.navigate("RegisterCavity")} />
      <SuccessModal
        visible={successSuccessModal}
        title="Topografia cadastrada com sucesso!"
        message="Suas informações topográficas foram salvas com sucesso no sistema."
        onPress={handleSuccessModalClose}
      />
      <DefaultTopographyModal
        isOpen={isOpenConfirmModal}
        title="Inserção de informações topográficas"
        message="Deseja finalizar o cadastro das informações topográficas e registrar as informações cadastradas? Uma vez finalizado o cadastro, não será mais possível realizar edições nas informações. "
        enableLongButton={true}
        enableBackButton={true}
        titleButtonConfirm="Sim, registrar informações"
        titleButtonCancel="Salvar para edições futuras"
        visibleIcon={false}
        onConfirm={() => handleCreateTopography()}
        onClose={() => handleCreateTopography()}
        onBack={() => setIsOpenConfirmModal(!isOpenConfirmModal)}
      />
    </SafeAreaView>
  )
};

export default TopographyCreateScreen;

const styles = StyleSheet.create({
  main: {
    backgroundColor: colors.dark[90],
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 25,
  },
  stepContainer: {
    flex: 1,
    width: "100%",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: "auto",
  },
});