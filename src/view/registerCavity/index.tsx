import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../assets/colors";
import { updateCurrentStep } from "../../redux/cavitySlice";
import { StepEight } from "./stepEight";
import { StepEleven } from "./stepEleven";
import { StepFive } from "./stepFive";
import { StepFour } from "./stepFour";
import { StepNine } from "./stepNine";
import { StepOne } from "./stepOne";
import { StepSeven } from "./stepSeven";
import { StepSix } from "./stepSix";
import { StepTen } from "./stepTen";
import { StepThree } from "./stepThree";
import { StepTwo } from "./stepTwo";
import { useSelector, useDispatch } from "react-redux";
import { Header } from "../../components/header";
import TextInter from "../../components/textInter";
import { FC, useRef, useState } from "react";
import { RouterProps } from "../../types";
import { SuccessModal } from "../../components/modal/successModal";

const RegisterCavity: FC<RouterProps> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [successSuccessModal, setSuccessModal] = useState(false);
  const currentStep = useSelector(
    (state: { cavity: { currentStep: number } }) => state.cavity.currentStep
  );

  const scrollViewRef = useRef<ScrollView>(null);

  const steps = [
    StepOne,
    StepTwo,
    StepThree,
    StepFour,
    StepFive,
    StepSix,
    StepSeven,
    StepEight,
    StepNine,
    StepTen,
    StepEleven,
  ];

  const StepComponent = steps[currentStep];

  return (
    <SafeAreaView style={styles.main}>
      <KeyboardAvoidingView
        style={styles.main}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView ref={scrollViewRef}>
          <View style={styles.container}>
            <Header
              title="Cadastrar"
              onCustomReturn={() =>
                currentStep > 0 && dispatch(updateCurrentStep(currentStep - 1))
              }
            />
            <StepComponent />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.buttonReturn}
                onPress={() => {
                  if (currentStep === 0) {
                    navigation.navigate("Home");
                    return;
                  }
                  dispatch(updateCurrentStep(currentStep - 1));
                }}
              >
                <TextInter color={colors.white[100]} weight="semi-bold">
                  Voltar
                </TextInter>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonNext}
                onPress={() => {
                  if (currentStep === 10) {
                    setSuccessModal(true);
                    return;
                  }
                  dispatch(updateCurrentStep(currentStep + 1));
                  if (scrollViewRef.current)
                    scrollViewRef.current.scrollTo({ y: 0, animated: true });
                }}
              >
                <TextInter color={colors.white[100]} weight="semi-bold">
                  {currentStep === 10 ? "Confirmar" : "Continuar"}
                </TextInter>
              </TouchableOpacity>
            </View>
          </View>
          <SuccessModal
            visible={successSuccessModal}
            title="Cadastro realizado com sucesso!"
            message="Sua caverna foi cadastrada com sucesso no sistema."
            onPress={() => {
              navigation.navigate("Home");
              setSuccessModal(false);
              dispatch(updateCurrentStep(0));
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterCavity;

const styles = StyleSheet.create({
  main: {
    backgroundColor: colors.dark[90],
    flex: 1,
  },
  container: {
    flex: 1,
    minHeight: "100%",
    backgroundColor: colors.dark[90],
    paddingHorizontal: 20,
    paddingBottom: 25,
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: 58,
  },
  buttonNext: {
    height: 58,
    width: "47%",
    backgroundColor: colors.accent[100],
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonReturn: {
    height: 58,
    width: "47%",
    backgroundColor: colors.dark[40],
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
