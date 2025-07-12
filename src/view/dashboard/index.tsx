import React, { FC, useState, useCallback } from "react";
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
} from "react-native";
import { colors } from "../../assets/colors";
import { Header } from "../../components/header";
import { StepOne } from "./stepOne";
import { StepTwo } from "./stepTwo";
import { NextButton } from "../../components/button/nextButton";
import { ReturnButton } from "../../components/button/returnButton";
import { RouterProps } from "../../types";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import {
  resetDashboardState,
  setDashboardLoading,
  setFilteredCavities,
} from "../../redux/dashboardSlice";
import { database } from "../../db";
import CavityRegister from "../../db/model/cavityRegister";
import { Q } from "@nozbe/watermelondb";
import { parseJsonField } from "../../util";

const Dashboard: FC<RouterProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const dispatch = useDispatch<AppDispatch>();
  const { filters, isLoading } = useSelector(
    (state: RootState) => state.dashboard
  );

  const handleApplyFilters = async () => {
    dispatch(setDashboardLoading(true));
    try {
      const cavityCollection = database.get<CavityRegister>("cavity_register");
      const queryFilters = [];

      if (filters.projetoId) {
        queryFilters.push(Q.where("projeto_id", filters.projetoId));
      }
      if (filters.nomeCavidade) {
        queryFilters.push(
          Q.where("nome_cavidade", Q.like(`%${filters.nomeCavidade}%`))
        );
      }
      if (filters.codigoCavidade) {
        // Supondo que o campo no DB seja 'codigo_cavidade'
        queryFilters.push(
          Q.where("codigo_cavidade", Q.like(`%${filters.codigoCavidade}%`))
        );
      }
      if (filters.municipio) {
        queryFilters.push(
          Q.where("municipio", Q.like(`%${filters.municipio}%`))
        );
      }

      const cavities = await cavityCollection.query(...queryFilters).fetch();

      // Parseia os dados JSON para o formato correto do tipo Cavidade
      const parsedCavities = cavities.map((cm) => ({
        ...cm._raw,
        entradas: parseJsonField(cm.entradas, "entradas", []),
        // Adicione o parse para todos os outros campos JSON aqui...
        dificuldades_externas: parseJsonField(
          cm.dificuldades_externas,
          "dificuldades_externas"
        ),
        aspectos_socioambientais: parseJsonField(
          cm.aspectos_socioambientais,
          "aspectos_socioambientais"
        ),
        espeleotemas: parseJsonField(cm.espeleotemas, "espeleotemas", []),
      }));

      dispatch(setFilteredCavities(parsedCavities as any));
      setCurrentStep(1); // Avança para a tela de gráficos
    } catch (error) {
      console.error("Erro ao buscar cavidades para o dashboard:", error);
    } finally {
      dispatch(setDashboardLoading(false));
    }
  };

  const handleClear = () => {
    dispatch(resetDashboardState());
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      dispatch(resetDashboardState());
      navigation.navigate("HomeScreen");
    }
  };

  return (
    <SafeAreaView style={styles.main}>
      <Header title="Dashboard" onCustomReturn={handleBack} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          {currentStep === 0 && <StepOne />}
          {currentStep === 1 && <StepTwo />}
        </View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.accent[100]} />
        ) : (
          currentStep === 0 && (
            <>
              <ReturnButton buttonTitle="Limpar" onPress={handleClear} />
              <NextButton onPress={handleApplyFilters} buttonTitle="Aplicar" />
            </>
          )
        )}
      </View>
    </SafeAreaView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  main: {
    backgroundColor: colors.dark[90],
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around", // space-around para centralizar o loading
    alignItems: "center",
    width: "100%",
    height: 80,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: colors.dark[70],
  },
});
