import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { colors } from "../../assets/colors";
import { resetCavidadeState, updateCurrentStep } from "../../redux/cavitySlice";
import { useSelector, useDispatch } from "react-redux";
import { Header } from "../../components/header";
import TextInter from "../../components/textInter";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Biota,
  Cavidade,
  Dificuldades_externas,
  RouterProps,
  CaracterizacaoInterna,
  CavityRegisterData,
} from "../../types";
import { SuccessModal } from "../../components/modal/successModal";
import { StepOne } from "./stepOne";
import { StepTwo } from "./stepTwo";
import { StepThree } from "./stepThree";
import { StepFour } from "./stepFour";
import { StepFive } from "./stepFive";
import { StepSix } from "./stepSix";
import { StepSeven } from "./stepSeven";
import { StepEight } from "./stepEight";
import { StepNine } from "./stepNine";
import { StepTen } from "./stepTen";
import { RootState } from "../../redux/store";
import { createCavityRegister } from "../../db/controller";
import { showError } from "../../redux/loadingSlice";
import { NextButton } from "../../components/button/nextButton";
import { ReturnButton } from "../../components/button/returnButton";
import uuid from "react-native-uuid";
import { useFocusEffect } from "@react-navigation/native";
import { formatDateToInput } from "../../util";

export interface StepComponentProps extends RouterProps {
  validationAttempted: boolean;
}

// Consider moving isFieldFilled to a shared utils file
const isFieldFilled = (value: any): boolean => {
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
  if (!data) return false;

  switch (stepIndex) {
    case 0: // Step One: Basic Info
      return (
        // isFieldFilled(data.projeto_id) && // Removed
        isFieldFilled(data.nome_cavidade) &&
        Array.isArray(data.entradas) &&
        data.entradas.length > 0 &&
        data.municipio.length > 0 &&
        data.uf.length > 0 &&
        data.nome_sistema.length > 0 &&
        data.entradas.every((entrada) => isFieldFilled(entrada.nome)) // Ensure each entrance has a name
      );

    case 1: // Step Two: Desenvolvimento Linear e Dificuldades Externas
      const de = data.dificuldades_externas;
      if (!de) return true; // If Dificuldades_externas is optional and not filled, step is valid
      if (de.outroEnabled === true && !isFieldFilled(de.outro)) {
        return false;
      }
      const specificKeys: (keyof Omit<
        Dificuldades_externas,
        "nenhuma" | "outroEnabled" | "outro"
      >)[] = [
        "rastejamento",
        "quebra_corpo",
        "teto_baixo",
        "natacao",
        "sifao",
        "blocos_instaveis",
        "lances_verticais",
        "cachoeira",
        "trechos_escorregadios",
        "passagem_curso_agua",
      ];
      const algumaEspecificaMarcada = specificKeys.some(
        (key) => de[key] === true
      );
      const outroValido = de.outroEnabled === true && isFieldFilled(de.outro);

      if (de.nenhuma === true) {
        // If "Nenhum" is true
        return !algumaEspecificaMarcada && !(de.outroEnabled === true); // No other option should be true
      }
      // If "Nenhum" is false, at least one other option must be selected/filled
      return algumaEspecificaMarcada || outroValido;

    case 2: // Step Three: Aspectos Socioambientais
      const aspectos = data.aspectos_socioambientais;
      console.log(aspectos);
      if (!aspectos) return true; // If optional and not filled

      if (aspectos.comunidade_envolvida?.envolvida === true) {
        if (!isFieldFilled(aspectos.comunidade_envolvida.descricao)) {
          return false;
        }
      }

      const ap = aspectos.area_protegida;
      // If area_protegida exists, validate its internals
      if (ap) {
        const federalSelected =
          ap.federal &&
          isFieldFilled(ap.federal.nome) &&
          isFieldFilled(ap.federal.zona);
        const estadualSelected =
          ap.estadual &&
          isFieldFilled(ap.estadual.nome) &&
          isFieldFilled(ap.estadual.zona);
        const municipalSelected =
          ap.municipal &&
          isFieldFilled(ap.municipal.nome) &&
          isFieldFilled(ap.municipal.zona);
        const naoDeterminadoSelected = ap.nao_determinado === true;

        // Check for partial filling
        if (
          ap.federal &&
          (!isFieldFilled(ap.federal.nome) || !isFieldFilled(ap.federal.zona))
        )
          return false;
        if (
          ap.estadual &&
          (!isFieldFilled(ap.estadual.nome) || !isFieldFilled(ap.estadual.zona))
        )
          return false;
        if (
          ap.municipal &&
          (!isFieldFilled(ap.municipal.nome) ||
            !isFieldFilled(ap.municipal.zona))
        )
          return false;

        // If none are specifically selected, 'nao_determinado' must be true
        if (
          !federalSelected &&
          !estadualSelected &&
          !municipalSelected &&
          !naoDeterminadoSelected
        ) {
          // This condition means something needs to be chosen if area_protegida object exists.
          // Or, if it's okay for area_protegida to exist but be "empty" (other than nao_determinado false), adjust this.
          // Assuming if 'ap' exists, one state must be valid or nao_determinado is true.
          // If the UI ensures that if one is picked, 'nao_determinado' is false, this covers it.
          // The typical case: if user interacts with federal/state/municipal, then one of them OR nao_determinado should be valid.
          // if no options (federal, estadual, municipal) are even partially filled, and nao_determinado is not true, then it is invalid.
          const anyPartial =
            ap.federal?.nome ||
            ap.federal?.zona ||
            ap.estadual?.nome ||
            ap.estadual?.zona ||
            ap.municipal?.nome ||
            ap.municipal?.zona;
          if (
            anyPartial &&
            !naoDeterminadoSelected &&
            !federalSelected &&
            !estadualSelected &&
            !municipalSelected
          )
            return false;
          if (!anyPartial && !naoDeterminadoSelected) return false; // Nothing selected at all
        }
      }

      if (aspectos.uso_cavidade?.outroEnabled === true) {
        if (!isFieldFilled(aspectos.uso_cavidade.outro)) {
          return false;
        }
      }
      // Add validation for 'uso_cavidade' options if 'outroEnabled' is false and no other boolean is true
      if (
        aspectos.uso_cavidade &&
        aspectos.uso_cavidade.outroEnabled === false
      ) {
        const usoSpecifics = Object.keys(aspectos.uso_cavidade).filter(
          (k) => k !== "outro" && k !== "outroEnabled"
        );
        const anyUsoSelected = usoSpecifics.some(
          (k) => (aspectos.uso_cavidade as any)[k] === true
        );
        // if (!anyUsoSelected) return false; // If 'outro' not enabled, at least one specific use must be true
      }

      return true;

    case 3: // Step Four: Caracterização Interna
    const caracterizacao = data.caracterizacao_interna as
        | CaracterizacaoInterna
        | undefined;
      if (!caracterizacao) return true;

      const gl = caracterizacao.grupo_litologico;
      if (gl?.outro !== undefined && !isFieldFilled(gl.outro)) {
        return false;
      }

      // "Desenvolvimento predominante" is now optional.
      // if (!caracterizacao.desenvolvimento_predominante) return false;

      if (
        (caracterizacao.depredacao_localizada === true &&
          !isFieldFilled(caracterizacao.descricao_depredacao_localizada)) ||
        (caracterizacao.depredacao_intensa === true &&
          !isFieldFilled(caracterizacao.descricao_depredacao_intensa))
      ) {
        return false;
      }

      const infraInterna = caracterizacao.infraestrutura_interna;
      if (infraInterna) {
        if (infraInterna.nenhuma === true) {
          if (
            infraInterna.passarela ||
            infraInterna.corrimao?.ferro ||
            infraInterna.corrimao?.madeira ||
            infraInterna.corrimao?.corda ||
            isFieldFilled(infraInterna.corrimao?.outro) ||
            infraInterna.portao ||
            infraInterna.escada ||
            infraInterna.corda ||
            infraInterna.iluminacao_artificial ||
            infraInterna.ponto_ancoragem ||
            (infraInterna.outroEnabled && isFieldFilled(infraInterna.outros))
          ) {
            return false;
          }
        } else {
          const corrimaoSelected =
            infraInterna.corrimao &&
            (infraInterna.corrimao.ferro ||
              infraInterna.corrimao.madeira ||
              infraInterna.corrimao.corda ||
              isFieldFilled(infraInterna.corrimao.outro));
          const otherInfraSelected =
            infraInterna.passarela ||
            infraInterna.portao ||
            infraInterna.escada ||
            infraInterna.corda ||
            infraInterna.iluminacao_artificial ||
            infraInterna.ponto_ancoragem;
          const outroInfraFilled =
            infraInterna.outroEnabled && isFieldFilled(infraInterna.outros);

          if (!corrimaoSelected && !otherInfraSelected && !outroInfraFilled)
            return false;
          if (
            infraInterna.outroEnabled === true &&
            !isFieldFilled(infraInterna.outros)
          )
            return false;
        }
      } else {
        return false;
      }

      const difProg = caracterizacao.dificuldades_progressao_interna;
      if (difProg) {
        if (difProg.nenhuma === true) {
          const anySpecificDifProg =
            difProg.teto_baixo ||
            difProg.blocos_instaveis ||
            difProg.trechos_escorregadios ||
            difProg.rastejamento ||
            difProg.natacao ||
            difProg.lances_verticais ||
            difProg.passagem_curso_agua ||
            difProg.quebra_corpo ||
            difProg.sifao ||
            difProg.cachoeira ||
            isFieldFilled(difProg.outro);
          if (anySpecificDifProg) return false;
        } else {
          const anySpecificDifProg =
            difProg.teto_baixo ||
            difProg.blocos_instaveis ||
            difProg.trechos_escorregadios ||
            difProg.rastejamento ||
            difProg.natacao ||
            difProg.lances_verticais ||
            difProg.passagem_curso_agua ||
            difProg.quebra_corpo ||
            difProg.sifao ||
            difProg.cachoeira;
          const outroDifProgFilled = isFieldFilled(difProg.outro);
          if (!anySpecificDifProg && !outroDifProgFilled) return false;
        }
      } else {
        return false;
      }
      return true;

    case 4: // Step Five: Topografia e Morfologia
      const morfologia = data.morfologia;
      if (morfologia) {
        const pp = morfologia.padrao_planimetrico;
        if (pp) {
          const anyPPSelected =
            pp.retilinea ||
            pp.anastomosada ||
            pp.espongiforme ||
            pp.labirintica ||
            pp.reticulado ||
            pp.ramiforme ||
            pp.dendritico;
          const outroPPFilled = isFieldFilled(pp.outro);
          if (!anyPPSelected && !outroPPFilled) return false; // Must select a type or fill outro
        } else {
          return false; // padrao_planimetrico is mandatory if morfologia exists
        }

        const fs = morfologia.forma_secoes;
        if (fs) {
          const anyFSSelected =
            fs.circular ||
            fs.eliptica_vertical ||
            fs.eliptica_horizontal ||
            fs.eliptica_inclinada ||
            fs.lenticular_vertical ||
            fs.lenticular_horizontal ||
            fs.poligonal ||
            fs.poligonal_tabular ||
            fs.triangular ||
            fs.fechadura ||
            fs.linear_inclinada ||
            fs.linear_vertical ||
            fs.irregular ||
            fs.mista;
          const outroFSFilled = isFieldFilled(fs.outro);
          if (!anyFSSelected && !outroFSFilled) return false; // Must select a type or fill outro
        } else {
          return false; // forma_secoes is mandatory if morfologia exists
        }
      } else {
        return true; // Morfologia itself is optional in Cavidade type. If present, its children are mandatory.
        // If morfologia must be filled if topografia is filled, this needs cross-field validation.
        // Assuming morfologia can be independently optional.
      }

      // Topografia validation (if it's mandatory or has internal requirements)
      const topografia = data.topografia;
      if (topografia) {
        const esp = topografia.espeleometria;
        if (
          !esp ||
          (esp.projecao_horizontal === undefined &&
            esp.desnivel_piso === undefined &&
            esp.area === undefined &&
            esp.volume === undefined)
        ) {
          // If espeleometria object exists but all fields are undefined, consider it unfilled.
          // Or, if any one is enough, this is fine.
          // Assuming if topografia object exists, espeleometria should have at least one value or be absent.
          // If espeleometria is mandatory within topografia:
          // if (!esp) return false;
          // if (Object.values(esp).every(v => v === undefined || v === null || v === '' || (typeof v === 'number' && isNaN(v)))) return false;
        }
        const prev = topografia.previsao;
        if (prev && prev.bcra === undefined && prev.uis === undefined) {
          // similar logic for previsao if it's mandatory to have one
        }
      }
      // Assuming topografia itself is optional. If present, its children might have mandatory aspects.
      // For now, just checking morfologia as per original structure.

      return true;

    case 5: // Step Six: Hidrologia
    const hydro = data.hidrologia;
    if (!hydro) return true;

    const checkWaterFeature = (feature?: {
      possui?: boolean;
      tipo?: string;
    }) => {
      if (feature?.possui && !isFieldFilled(feature.tipo)) {
          return false;
      }
      return true;
    };

    if (!checkWaterFeature(hydro.curso_agua)) return false;
    if (!checkWaterFeature(hydro.lago)) return false;
    if (!checkWaterFeature(hydro.sumidouro)) return false;
    if (!checkWaterFeature(hydro.surgencia)) return false;
    if (!checkWaterFeature(hydro.gotejamento)) return false;
    if (!checkWaterFeature(hydro.condensacao)) return false;
    if (!checkWaterFeature(hydro.empossamento)) return false;
    if (!checkWaterFeature(hydro.exudacao)) return false;

    if (hydro.outro !== undefined && !isFieldFilled(hydro.outro)) {
      return false;
    }

    return true;

    case 6: // Step Seven: Sedimentos
      const sed = data.sedimentos;
      if (!sed) return true;

      let isClasticaValid = true;
      if (sed.sedimentacao_clastica?.possui) {
        const clastica = sed.sedimentacao_clastica;
        if (!clastica.tipo && !clastica.outroEnabled) {
          isClasticaValid = false;
        } else {
          let algumaSubOpcaoClasticaValida = false;
          if (clastica.tipo) {
            const clasticaTipo = clastica.tipo;
            const checkGrainSize = (grain?: {
              distribuicao?: string;
              origem?: string;
            }) =>
              grain
                ? isFieldFilled(grain.distribuicao) &&
                  isFieldFilled(grain.origem)
                : false;

            if (
              clasticaTipo.rochoso ||
              checkGrainSize(clasticaTipo.argila) ||
              checkGrainSize(clasticaTipo.silte) ||
              checkGrainSize(clasticaTipo.areia) ||
              checkGrainSize(clasticaTipo.fracao_granulo) ||
              checkGrainSize(clasticaTipo.seixo_predominante) ||
              checkGrainSize(clasticaTipo.fracao_calhau) ||
              checkGrainSize(clasticaTipo.matacao_predominante)
            ) {
              algumaSubOpcaoClasticaValida = true;
            }
          }
          if (clastica.outroEnabled) {
            if (isFieldFilled(clastica.outros)) {
              algumaSubOpcaoClasticaValida = true;
            } else {
              isClasticaValid = false; // Set to false directly if 'outro' is enabled but not filled
            }
          }
          if (!algumaSubOpcaoClasticaValida && isClasticaValid) {
            // If still valid but no option found
            isClasticaValid = false;
          }
        }
      }

      let isOrganicaValid = true;
      if (sed.sedimentacao_organica?.possui) {
        const organica = sed.sedimentacao_organica;
        if (!organica.tipo && !organica.outroEnabled) {
          isOrganicaValid = false;
        } else {
          let algumaSubOpcaoOrganicaValida = false;
          if (organica.tipo) {
            const orgTipo = organica.tipo;
            if (orgTipo.guano) {
              const guano = orgTipo.guano;
              if (
                (guano.carnivoro?.possui &&
                  isFieldFilled(guano.carnivoro.tipo)) ||
                (guano.frugivoro?.possui &&
                  isFieldFilled(guano.frugivoro.tipo)) ||
                (guano.hematofago?.possui &&
                  isFieldFilled(guano.hematofago.tipo)) ||
                (guano.inderterminado?.possui &&
                  isFieldFilled(guano.inderterminado.tipo))
              ) {
                algumaSubOpcaoOrganicaValida = true;
              }
            }
            if (
              orgTipo.folhico ||
              orgTipo.galhos ||
              orgTipo.raizes ||
              orgTipo.vestigios_ninhos ||
              orgTipo.pelotas_regurgitacao
            ) {
              algumaSubOpcaoOrganicaValida = true;
            }
          }
          if (organica.outroEnabled) {
            if (isFieldFilled(organica.outros)) {
              algumaSubOpcaoOrganicaValida = true;
            } else {
              isOrganicaValid = false; // Set to false directly
            }
          }
          if (!algumaSubOpcaoOrganicaValida && isOrganicaValid) {
            isOrganicaValid = false;
          }
        }
      }
      // If 'sedimentos' object exists, at least one of its main sections must be 'possui: true' and valid,
      // or it means the user opened the section but didn't fill anything.
      if (
        sed.sedimentacao_clastica?.possui === false &&
        sed.sedimentacao_organica?.possui === false
      ) {
        // If both are explicitly false, it's valid.
      } else if (sed.sedimentacao_clastica?.possui && !isClasticaValid) {
        return false;
      } else if (sed.sedimentacao_organica?.possui && !isOrganicaValid) {
        return false;
      } else if (
        !sed.sedimentacao_clastica?.possui &&
        !sed.sedimentacao_organica?.possui
      ) {
        // This implies the 'sedimentos' object exists but nothing is selected.
        // This could be an invalid state if user interaction is expected.
        // If the 'sedimentos' section itself is optional, then this is fine if no 'possui' is true.
        // However, if 'sedimentos' object exists AT ALL, it implies user intended to fill it.
        // For now, if neither 'possui' is true, treat as valid (empty section).
      }

      return isClasticaValid && isOrganicaValid; // Will be true if both 'possui' are false.

    case 7: // Step Eight: Espeleotemas
    const esp = data.espeleotemas;
    // If espeleotemas object doesn't exist or 'possui' is explicitly false, it's valid
    if (!esp || esp.possui === false) {
      return true;
    }
    // If 'possui' is true, then validation applies
    if (!Array.isArray(esp.tipos) || esp.tipos.length === 0) {
      return false;
    }
    const todosItensValidos = esp.tipos.every(
      (item) =>
        isFieldFilled(item.tipo) &&
        isFieldFilled(item.porte) &&
        isFieldFilled(item.frequencia) &&
        isFieldFilled(item.estado_conservacao)
    );
    if (!todosItensValidos) return false;
    return true;

    case 8: // Step Nine: Biota
      const biota = data.biota;
      if (!biota) return true; // Valid if biota section is not touched

      const checkBiotaCategoryWithBooleans = (categoryData?: {
        possui?: boolean;
        outroEnabled?: boolean;
        outro?: string;
        [key: string]: any;
      }) => {
        if (!categoryData || categoryData.possui === false) return true; // Valid if not present or 'possui' is false
        // If 'possui' is true:
        const specificTypeSelected = Object.keys(categoryData).some(
          (key) =>
            key !== "possui" &&
            key !== "outroEnabled" &&
            key !== "outro" &&
            categoryData[key] === true
        );
        const outroValid =
          categoryData.outroEnabled && isFieldFilled(categoryData.outro);

        if (!specificTypeSelected && !outroValid) return false; // Must select a type or fill 'outro'
        if (categoryData.outroEnabled && !isFieldFilled(categoryData.outro))
          return false; // If 'outro' enabled, it must be filled
        return true;
      };

      const checkBiotaStandardCategory = (categoryData?: {
        possui?: boolean;
        tipos?: string[];
        outroEnabled?: boolean;
        outro?: string;
      }) => {
        if (!categoryData || categoryData.possui === false) return true;
        // If 'possui' is true:
        const tiposValidos =
          Array.isArray(categoryData.tipos) && categoryData.tipos.length > 0;
        const outroValido =
          categoryData.outroEnabled && isFieldFilled(categoryData.outro);
        if (!tiposValidos && !outroValido) return false;
        if (categoryData.outroEnabled && !isFieldFilled(categoryData.outro))
          return false;
        return true;
      };

      const checkMorcegos = (morcegos?: Biota["morcegos"]) => {
        if (!morcegos || morcegos.possui === false) return true;
        // If 'possui' is true:
        if (!Array.isArray(morcegos.tipos) || morcegos.tipos.length === 0)
          return false; // Must have at least one type
        return morcegos.tipos.every(
          (m) => isFieldFilled(m.tipo) && isFieldFilled(m.quantidade)
        ); // Each type must have tipo and quantidade
      };

      const peixesValido =
        biota.peixes === undefined || typeof biota.peixes === "boolean"; // True if not selected or explicitly true/false

      // If biota object exists, assume user intended to fill something or explicitly mark 'possui: false' for subsections.
      // This means if any subsection has 'possui: true' it must be valid.
      // If all subsections have 'possui: false' (or are undefined), then it's valid.

      if (
        !checkBiotaCategoryWithBooleans(biota.invertebrado) ||
        !checkBiotaCategoryWithBooleans(biota.invertebrado_aquatico) ||
        !checkBiotaStandardCategory(biota.anfibios) ||
        !checkBiotaStandardCategory(biota.repteis) ||
        !checkBiotaStandardCategory(biota.aves) ||
        !checkMorcegos(biota.morcegos) ||
        !peixesValido // This just checks if it's a boolean, not if it's true and needs more data.
      ) {
        return false;
      }
      return true;

    case 9: // Step Ten: Arqueologia & Paleontologia
      const validateArchPalSection = (sectionData?: {
        possui?: boolean;
        tipos?: {
          [key: string]: boolean | string | undefined; // Allows boolean flags and 'outro' string
          outroEnabled?: boolean;
        };
      }): boolean => {
        if (!sectionData || sectionData.possui === false) return true; // Valid if not present or 'possui' is false
        // If 'possui' is true:
        if (!sectionData.tipos) return false; // 'tipos' object must exist

        const tipos = sectionData.tipos;
        if (tipos.outroEnabled === true && !isFieldFilled(tipos.outro)) {
          return false; // If 'outro' enabled, it must be filled
        }

        const hasSpecificTypeBoolean = Object.keys(tipos).some(
          (key) =>
            key !== "outroEnabled" &&
            key !== "outro" &&
            typeof tipos[key] === "boolean" &&
            tipos[key] === true
        );

        const outroPreenchidoCorretamente =
          tipos.outroEnabled === true && isFieldFilled(tipos.outro);

        // If 'outro' is not enabled, at least one specific type must be true
        if (
          tipos.outroEnabled === false ||
          typeof tipos.outroEnabled === "undefined"
        ) {
          return hasSpecificTypeBoolean;
        }
        // If 'outro' is enabled, then either a specific type OR 'outro' itself must be valid
        return hasSpecificTypeBoolean || outroPreenchidoCorretamente;
      };

      if (
        !validateArchPalSection(data.arqueologia) ||
        !validateArchPalSection(data.paleontologia)
      ) {
        return false;
      }
      return true;

    default:
      return true;
  }
};

const RegisterCavity: FC<RouterProps> = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const [successSuccessModal, setSuccessModal] = useState(false);
  const { currentStep, formData } = useSelector((state: RootState) => ({
    currentStep: state.cavity.currentStep,
    formData: state.cavity.cavidade,
  }));

  const [validationAttempted, setValidationAttempted] = useState(false);

  useEffect(() => {
    // console.log(`Step ${currentStep} FormData:`, JSON.stringify(formData, null, 2));
  }, [formData, currentStep]);

  const scrollViewRef = useRef<ScrollView>(null);

  const steps: FC<StepComponentProps>[] = [
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

  const StepComponent: FC<StepComponentProps> = steps[currentStep];

  const isCurrentStepValid = useMemo(
    () => validateStep(currentStep, formData),
    [currentStep, formData]
  );

  const handleNext = async () => {
    setValidationAttempted(true);
    const isValidOnClick = validateStep(currentStep, formData);
    console.log(formData.data);
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

    setValidationAttempted(false); // Reset for the next step

    if (currentStep === steps.length - 1) {
      try {
        if (!formData) {
          // Should not happen if validation passes, but good check
          throw new Error("Form data is missing.");
        }

        const cavityPayload: CavityRegisterData = {
          registro_id: uuid.v4().toString(),
          projeto_id: formData.projeto_id || "",
          responsavel: formData.responsavel || "",
          nome_cavidade: formData.nome_cavidade || "",
          nome_sistema: formData.nome_sistema || "",
          data: formData.data
            ? (() => {
                try {
                  const [d, m, y] = formData.data.split("/").map(Number);
                  if (
                    isNaN(d) ||
                    isNaN(m) ||
                    isNaN(y) ||
                    m < 1 ||
                    m > 12 ||
                    d < 1 ||
                    d > 31
                  ) {
                    throw new Error("Invalid date format");
                  }
                  return formatDateToInput(
                    new Date(y, m - 1, d, 12, 0, 0, 0).toISOString()
                  );
                } catch (e) {
                  return formatDateToInput(new Date().toISOString());
                }
              })()
            : formatDateToInput(new Date().toISOString()),
          municipio: formData.municipio || "",
          uf: formData.uf || "",
          localidade: formData.localidade, // Already optional
          entradas: JSON.stringify(formData.entradas || []),
          desenvolvimento_linear:
            formData.desenvolvimento_linear === undefined
              ? null
              : formData.desenvolvimento_linear,
          dificuldades_externas: JSON.stringify(
            formData.dificuldades_externas || {}
          ),
          aspectos_socioambientais: JSON.stringify(
            formData.aspectos_socioambientais || {}
          ),
          caracterizacao_interna: JSON.stringify(
            formData.caracterizacao_interna || {}
          ),
          topografia: JSON.stringify(formData.topografia || {}),
          morfologia: JSON.stringify(formData.morfologia || {}),
          hidrologia: JSON.stringify(formData.hidrologia || {}),
          sedimentos: JSON.stringify(formData.sedimentos || {}),
          espeleotemas: JSON.stringify(formData.espeleotemas || {}),
          biota: JSON.stringify(formData.biota || {}),
          arqueologia: JSON.stringify(formData.arqueologia || {}),
          paleontologia: JSON.stringify(formData.paleontologia || {}),
        };
        await createCavityRegister(cavityPayload);
        setSuccessModal(true);
      } catch (error) {
        console.error("Error creating cavity register:", error);
        dispatch(
          showError({
            title: "Erro ao criar cavidade",
            message:
              error instanceof Error
                ? error.message
                : "Confirme as informações e tente novamente.",
          })
        );
      }
    } else {
      dispatch(updateCurrentStep(currentStep + 1));
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    }
  };

  const handleBack = () => {
    setValidationAttempted(false); // Reset validation attempt when going back
    if (currentStep === 0) {
      Alert.alert(
        "Sair do Cadastro?",
        "Dados não salvos serão perdidos. Deseja continuar?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sair",
            style: "destructive",
            onPress: () => {
              navigation.navigate("CavityScreen");
              dispatch(resetCavidadeState());
            },
          },
        ]
      );
    } else {
      dispatch(updateCurrentStep(currentStep - 1));
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // This logic is now primarily handled in handleBack() for the UI back button.
        // This hardwareBackPress listener can call handleBack or a more generic exit confirmation.
        handleBack(); // Or a more generic exit confirmation that calls handleBack logic
        return true; // Prevent default hardware back button action
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => subscription.remove();
    }, [navigation, dispatch, currentStep]) // Added currentStep to dependencies of handleBack
  );

  const handleSuccessModalClose = () => {
    setSuccessModal(false);
    dispatch(resetCavidadeState()); // Resets currentStep to 0 and formData
    navigation.navigate("CavityScreen");
  };

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
          <Header title="Cadastrar Caverna" onCustomReturn={handleBack} />
          <View style={styles.stepContainer}>
            {StepComponent ? (
              <StepComponent
                navigation={navigation}
                route={route}
                validationAttempted={validationAttempted}
              />
            ) : (
              <TextInter>Carregando etapa...</TextInter>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <ReturnButton onPress={handleBack} />
            <NextButton
              onPress={handleNext}
              disabled={validationAttempted && !isCurrentStepValid}
              buttonTitle={
                currentStep === steps.length - 1 ? "Cadastrar" : "Continuar"
              }
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <SuccessModal
        visible={successSuccessModal}
        title="Cadastro realizado com sucesso!"
        message="Sua caverna foi cadastrada com sucesso no sistema."
        onPress={handleSuccessModalClose}
      />
    </SafeAreaView>
  );
};

export default RegisterCavity;

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
