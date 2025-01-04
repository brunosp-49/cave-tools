import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../assets/colors";
import { Header } from "../../components/header";
import TextInter from "../../components/textInter";
import { FC, useState } from "react";
import { RouterProps } from "../../types";
import { StepOne } from "./stepOne";
import { StepTwo } from "./stepTwo";
import { ScrollView } from "react-native-gesture-handler";

const Dashboard: FC<RouterProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [StepOne, StepTwo];

  const StepComponent = steps[currentStep];

  return (
    <SafeAreaView style={styles.main}>
      <KeyboardAvoidingView
        style={styles.main}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView>
          <View style={styles.container}>
            <Header
              title="Dashboard"
              onCustomReturn={() =>
                currentStep > 0
                  ? setCurrentStep(currentStep - 1)
                  : navigation.navigate("Home")
              }
            />
            <StepComponent />
            {currentStep === 0 && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.buttonReturn}
                  onPress={() => {}}
                >
                  <TextInter color={colors.white[100]} weight="semi-bold">
                    Limpar
                  </TextInter>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buttonNext}
                  onPress={() => setCurrentStep(1)}
                >
                  <TextInter color={colors.white[100]} weight="semi-bold">
                    Aplicar
                  </TextInter>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Dashboard;

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
