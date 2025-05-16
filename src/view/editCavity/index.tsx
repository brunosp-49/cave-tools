import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { colors } from "../../assets/colors";
import {
  resetCavidadeState,
  setFullInfos,
  updateCurrentStep,
} from "../../redux/cavitySlice";
import { useSelector, useDispatch } from "react-redux";
import { Header } from "../../components/header";
import TextInter from "../../components/textInter";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Biota, Cavidade, RouterProps } from "../../types";
import { SuccessModal } from "../../components/modal/successModal";
import { RootState } from "../../redux/store";
import { createCavityRegister, updateCavity } from "../../db/controller";
import { showError } from "../../redux/loadingSlice";
import { NextButton } from "../../components/button/nextButton";
import { ReturnButton } from "../../components/button/returnButton";
import uuid from "react-native-uuid";
import { StepOne } from "./stepOne";
import { StepTwo } from "./stepTwo";
import StepThree from "./stepThree";
import { StepFour } from "./stepFour";
import { StepFive } from "./stepFive";
import { StepSix } from "./stepSix";
import { StepSeven } from "./stepSeven";
import { StepEight } from "./stepEight";
import { StepNine } from "./stepNine";
import { StepTen } from "./stepTen";
import { database } from "../../db";
import CavityRegister from "../../db/model/cavityRegister";
import { Divider } from "../../components/divider";
import { useFocusEffect } from "@react-navigation/native";
import { formatDateToInput } from "../../util";

const isFilled = (value: any): boolean => {
  if (value === null || typeof value === "undefined") {
    return false;
  }
  if (typeof value === "string" && value.trim() === "") {
    return false;
  }
  if (Array.isArray(value) && value.length === 0) {
    return false;
  }
  if (typeof value === "number" && isNaN(value)) {
    return false;
  }
  return true;
};

const validateStep = (
  stepIndex: number,
  data: Cavidade | undefined | null
): boolean => {
  if (!data) return false; // Cannot validate without data

  switch (stepIndex) {
    case 0: // Step One: Basic Info
      return (
        isFilled(data.projeto_id) &&
        isFilled(data.responsavel) &&
        isFilled(data.nome_cavidade) &&
        Array.isArray(data.entradas) &&
        data.entradas.length > 0 // Ensure 'entradas' array exists and is not empty
      );

    case 3: // Step Four: Internal Infrastructure (Corrimao part)
      // Requirement: "if corrimao is true..." - Assumption: This means the user is actively providing corrimao details.
      const corrimaoInfo =
        data.caracterizacao_interna?.infraestrutura_interna?.corrimao;
      if (corrimaoInfo) {
        // If the corrimao object exists in the state, validate its contents
        return (
          corrimaoInfo.ferro === true ||
          corrimaoInfo.madeira === true ||
          corrimaoInfo.corda === true ||
          isFilled(corrimaoInfo.outro) // Check if 'outro' text is filled
        );
      }
      // If no corrimao details are being entered, this specific validation passes.
      return true;

    case 5: // Step Six: Hidrologia
      const hydro = data.hidrologia;
      // If the entire Hidrologia section is optional, return true. If it's mandatory, return false.
      // Assuming optionality based on lack of specific requirement for the section itself.
      if (!hydro) return true;

      const checkWaterFeature = (feature?: {
        possui?: boolean;
        tipo?: "perene" | "intermitente" | "nao_soube_informar";
      }) => !feature?.possui || isFilled(feature.tipo); // Valid if not possui OR if possui and tipo is selected

      return (
        checkWaterFeature(hydro.curso_agua) &&
        checkWaterFeature(hydro.lago) &&
        checkWaterFeature(hydro.sumidouro) &&
        checkWaterFeature(hydro.surgencia) &&
        checkWaterFeature(hydro.gotejamento) &&
        checkWaterFeature(hydro.condensacao) &&
        checkWaterFeature(hydro.empossamento) &&
        checkWaterFeature(hydro.exudacao)
      );

    case 6: // Step Seven: Sedimentos
      const sed = data.sedimentos;
      // Assuming Sedimentos section itself is optional unless specified otherwise.
      if (!sed) return true;

      let isClasticaValid = true;
      const clastica = sed.sedimentacao_clastica;
      // Requirement interpretation: if 'rochoso' is checked, then for *any* grain size provided,
      // its 'distribuicao' and 'origem' must also be filled.
      if (clastica?.tipo?.rochoso === true) {
        const clasticaTipo = clastica.tipo;
        const checkGrainSize = (grain?: {
          distribuicao?: string;
          origem?: string;
        }): boolean => {
          // A grain type is valid if it exists AND has both distribution and origin filled.
          return grain
            ? isFilled(grain.distribuicao) && isFilled(grain.origem)
            : false;
        };
        // Check if AT LEAST ONE grain type is present AND valid according to checkGrainSize
        isClasticaValid = !!(
          (clasticaTipo.argila && checkGrainSize(clasticaTipo.argila)) ||
          (clasticaTipo.silte && checkGrainSize(clasticaTipo.silte)) ||
          (clasticaTipo.areia && checkGrainSize(clasticaTipo.areia)) ||
          (clasticaTipo.fracao_granulo &&
            checkGrainSize(clasticaTipo.fracao_granulo)) ||
          (clasticaTipo.seixo_predominante &&
            checkGrainSize(clasticaTipo.seixo_predominante)) ||
          (clasticaTipo.fracao_calhau &&
            checkGrainSize(clasticaTipo.fracao_calhau)) ||
          (clasticaTipo.matacao_predominante &&
            checkGrainSize(clasticaTipo.matacao_predominante))
        );
      } // If rochoso is not true, clastic validation passes for this rule.

      let isOrganicaValid = true;
      const organica = sed.sedimentacao_organica;
      if (organica?.possui === true) {
        const orgTipo = organica.tipo;
        // If 'possui' is true, check if at least one specific organic type is indicated.
        isOrganicaValid = !!(
          // Use double negation to ensure boolean result
          (
            (orgTipo?.guano && // Check if guano object exists AND has any 'possui' flag true within it
              (orgTipo.guano.carnivoro?.possui ||
                orgTipo.guano.frugivoro?.possui ||
                orgTipo.guano.hematofago?.possui ||
                orgTipo.guano.inderterminado?.possui)) ||
            orgTipo?.folhico === true ||
            orgTipo?.galhos === true ||
            orgTipo?.raizes === true ||
            orgTipo?.vestigios_ninhos === true ||
            orgTipo?.pelotas_regurgitacao === true
          )
        );
      } // If possui is not true, organic validation passes for this rule.
      return isClasticaValid && isOrganicaValid;

    case 8: // Step Nine: Biota
      const biota = data.biota;
      // Assuming Biota section itself is optional unless specified otherwise.
      if (!biota) return true;

      // Checks if 'possui' is false OR (if true) the 'tipos' array has items OR 'outro' is filled.
      const checkBiotaPossuiAndTipos = (feature?: {
        possui?: boolean;
        tipos?: string[];
        outro?: string;
      }) =>
        !feature?.possui ||
        (Array.isArray(feature.tipos) && feature.tipos.length > 0) ||
        isFilled(feature.outro);

      // Checks morcegos: valid if not 'possui', or if 'possui' and 'tipos' array has items,
      // AND every item in the array has both 'tipo' and 'quantidade' filled.
      const checkMorcegos = (morcegos?: Biota["morcegos"]) => {
        if (!morcegos?.possui) return true;
        if (!Array.isArray(morcegos.tipos) || morcegos.tipos.length === 0)
          return false;
        return morcegos.tipos.every(
          (m) => isFilled(m.tipo) && isFilled(m.quantidade)
        );
      };

      // Add validation for biota.peixes if required by Step 9 (e.g., isFilled(biota.peixes))
      return (
        checkBiotaPossuiAndTipos(biota.invertebrados) &&
        checkBiotaPossuiAndTipos(biota.invertebrados_aquaticos) &&
        checkBiotaPossuiAndTipos(biota.anfibios) &&
        checkBiotaPossuiAndTipos(biota.repteis) &&
        checkBiotaPossuiAndTipos(biota.aves) &&
        checkMorcegos(biota.morcegos)
        // && isFilled(biota.peixes) // Uncomment if required
      );

    case 9: // Step Ten: Arqueologia & Paleontologia
      let isArqueologiaValid = true;
      const arq = data.arqueologia;
      // If 'possui' is true, at least one specific type must be checked or 'outro' filled.
      if (arq?.possui === true) {
        const arqTipos = arq.tipos;
        isArqueologiaValid = !!(
          // Ensure boolean result
          (
            arqTipos?.material_litico === true ||
            arqTipos?.material_ceramico === true ||
            arqTipos?.pintura_rupestre === true ||
            arqTipos?.gravura === true ||
            arqTipos?.ossada_humana === true ||
            arqTipos?.enterramento === true ||
            arqTipos?.nao_identificado === true ||
            isFilled(arqTipos?.outro)
          )
        );
      } // If possui is false, validation passes.

      let isPaleontologiaValid = true;
      const pal = data.paleontologia;
      // If 'possui' is true, at least one specific type must be checked or 'outro' filled.
      if (pal?.possui === true) {
        const palTipos = pal.tipos;
        isPaleontologiaValid = !!(
          // Ensure boolean result
          (
            palTipos?.ossada === true ||
            palTipos?.iconofossil === true ||
            palTipos?.jazigo === true ||
            palTipos?.nao_identificado === true ||
            isFilled(palTipos?.outro)
          )
        );
      } // If possui is false, validation passes.
      return isArqueologiaValid && isPaleontologiaValid;

    // Add cases for other steps (1, 2, 4, 7) if they have mandatory fields
    // case 1: return isFilled(data.someFieldForStep2) && ... ;

    default:
      // Steps without specific validation rules defined above are considered valid.
      return true;
  }
};

const EditCavity: FC<RouterProps> = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const [successSuccessModal, setSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentStep, formData } = useSelector((state: RootState) => ({
    currentStep: state.cavity.currentStep,
    formData: state.cavity.cavidade,
  }));

  useEffect(() => {
    console.log({ formData });
  }, [formData]);

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
  ];

  const StepComponent = steps[currentStep];

  const isCurrentStepValid = useMemo(
    () => validateStep(currentStep, formData),
    [currentStep, formData]
  );

  const handleNext = async () => {
    try {
      if (!isCurrentStepValid) {
        Alert.alert(
          "Campos Obrigatórios",
          "Por favor, preencha todos os campos obrigatórios corretamente antes de continuar."
        );
        return;
      }
      if (currentStep === steps.length - 1) {
        await updateCavity(route.params.cavityId ,{
          projeto_id: formData.projeto_id,
          responsavel: formData.responsavel,
          nome_cavidade: formData.nome_cavidade,
          nome_sistema: formData.nome_sistema,
          data: formData.data
            ? (() => {
                const [d, m, y] = formData.data.split("/").map(Number);
                return new Date(y, m - 1, d, 12).toISOString();
              })()
            : new Date().toISOString(),
          municipio: formData.municipio,
          uf: formData.uf,
          localidade: formData.localidade,
          entradas: JSON.stringify(formData.entradas),
          desenvolvimento_linear: formData.desenvolvimento_linear,
          dificuldades_externas: JSON.stringify(formData.dificuldades_externas),
          aspectos_socioambientais: JSON.stringify(
            formData.aspectos_socioambientais
          ),
          caracterizacao_interna: JSON.stringify(
            formData.caracterizacao_interna
          ),
          topografia: JSON.stringify(formData.topografia),
          morfologia: JSON.stringify(formData.morfologia),
          hidrologia: JSON.stringify(formData.hidrologia),
          sedimentos: JSON.stringify(formData.sedimentos),
          espeleotemas: JSON.stringify(formData.espeleotemas),
          biota: JSON.stringify(formData.biota),
          arqueologia: JSON.stringify(formData.arqueologia),
          paleontologia: JSON.stringify(formData.paleontologia),
        });
        setSuccessModal(true);
      } else {
        dispatch(updateCurrentStep(currentStep + 1));
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
      }
    } catch (error) {
      dispatch(
        showError({
          title: "Erro ao criar cavidade",
          message: "Confirme as informações e tente novamente.",
        })
      );
    }
  };

  const fetchCavity = useCallback(async () => {
    if (!route.params.cavityId) {
      setError("ID da cavidade não fornecido.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const cavityCollection =
        database.collections.get<CavityRegister>("cavity_register");
      const foundCavity = await cavityCollection.find(route.params.cavityId);
      const formattedData: Cavidade = {
        registro_id: foundCavity.registro_id,
        projeto_id: foundCavity.projeto_id,
        responsavel: foundCavity.responsavel,
        nome_cavidade: foundCavity.nome_cavidade,
        nome_sistema: foundCavity.nome_sistema,
        data: formatDateToInput(foundCavity.data),
        municipio: foundCavity.municipio,
        uf: foundCavity.uf,
        localidade: foundCavity.localidade,
        desenvolvimento_linear:
          foundCavity.desenvolvimento_linear ?? undefined,
        entradas: foundCavity.entradas
          ? JSON.parse(foundCavity.entradas)
          : [], // Parse entrada JSON string
        dificuldades_externas: foundCavity.dificuldades_externas
          ? JSON.parse(foundCavity.dificuldades_externas)
          : { nenhuma: true }, // Default if parsing fails
        aspectos_socioambientais: foundCavity.aspectos_socioambientais
          ? JSON.parse(foundCavity.aspectos_socioambientais)
          : {
              uso_cavidade: {},
              comunidade_envolvida: { envolvida: false },
              area_protegida: { nao_determinado: true },
              infraestrutura_acesso: { nenhuma: true },
            },
        caracterizacao_interna: foundCavity.caracterizacao_interna
          ? JSON.parse(foundCavity.caracterizacao_interna)
          : {
              grupo_litologico: {},
              infraestrutura_interna: { nenhuma: true },
              dificuldades_progressao_interna: { nenhuma: true },
            },
        topografia: foundCavity.topografia
          ? JSON.parse(foundCavity.topografia)
          : undefined,
        morfologia: foundCavity.morfologia
          ? JSON.parse(foundCavity.morfologia)
          : undefined,
        hidrologia: foundCavity.hidrologia
          ? JSON.parse(foundCavity.hidrologia)
          : undefined,
        sedimentos: foundCavity.sedimentos
          ? JSON.parse(foundCavity.sedimentos)
          : undefined,
        espeleotemas: foundCavity.espeleotemas
          ? JSON.parse(foundCavity.espeleotemas)
          : { possui: false, lista: [] },
        biota: foundCavity.biota ? JSON.parse(foundCavity.biota) : undefined,
        arqueologia: foundCavity.arqueologia
          ? JSON.parse(foundCavity.arqueologia)
          : { possui: false },
        paleontologia: foundCavity.paleontologia
          ? JSON.parse(foundCavity.paleontologia)
          : { possui: false },
      };
      dispatch(setFullInfos(formattedData));
    } catch (err) {
      console.error("Error fetching cavity details:", err);
      setError("Erro ao carregar detalhes da cavidade.");
    } finally {
      setIsLoading(false);
    }
  }, [route.params.cavityId]);

  useEffect(() => {
    fetchCavity();
  }, [fetchCavity]);

  useFocusEffect(
    useCallback(() => {
      fetchCavity();
    }, [fetchCavity])
  );

  const handleBack = () => {
    if (currentStep === 0) {
      navigation.navigate("CavityScreen");
      dispatch(resetCavidadeState());
    } else {
      dispatch(updateCurrentStep(currentStep - 1));
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
    }
  };

  const handleSuccessModalClose = () => {
    navigation.navigate("CavityScreen");
    setSuccessModal(false);
    dispatch(updateCurrentStep(0));
    dispatch(resetCavidadeState());
  };

  if (isLoading) {
    return (
      <View
        style={{
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.accent[100]} />
        <Divider />
        <TextInter color={colors.white[100]} weight="medium">
          Carregando detalhes...
        </TextInter>
      </View>
    );
  }

  if (!isLoading && error) {
    return (
      <View style={styles.centered}>
        <Header
          title="Erro"
          navigation={navigation}
          onCustomReturn={() => navigation.navigate("ProjectScreen")}
        />
        <Divider />
        <TextInter color={colors.error[100]} style={{ marginTop: 20 }}>
          {error}
        </TextInter>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.main}>
      <KeyboardAvoidingView
        style={styles.main}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        // keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // Adjust offset if needed
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Header title="Editar Caverna" onCustomReturn={handleBack} />
          <View style={styles.stepContainer}>
            {StepComponent ? (
              <StepComponent navigation={navigation} />
            ) : (
              <TextInter>Carregando etapa...</TextInter>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <ReturnButton onPress={handleBack} />
            <NextButton
              onPress={handleNext}
              disabled={!isCurrentStepValid}
              buttonTitle={
                currentStep === steps.length - 1 ? "Editar" : "Continuar"
              }
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <SuccessModal
        visible={successSuccessModal}
        title="Cavidade editada com sucesso!"
        message="Sua caverna foi editada com sucesso."
        onPress={handleSuccessModalClose}
      />
    </SafeAreaView>
  );
};

export default EditCavity;

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
    // alignItems: 'center', // Remove if steps control their own alignment
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: "auto",
  },
  buttonDisabled: {
    backgroundColor: colors.dark[50],
    opacity: 0.7,
  },
  centered: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: colors.dark[90],
  },
});
