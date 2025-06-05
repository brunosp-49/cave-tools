import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  Image,
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
import {
  Biota,
  Cavidade,
  Dificuldades_externas,
  RouterProps,
  CaracterizacaoInterna,
  Invertebrado,
  InvertebradoAquatico,
  AspectosSocioambientais,
  Sedimentos,
  Espeleotemas,
  Arqueologia,
  Paleontologia,
  Posicao_vertente,
  Insercao,
  Vegetacao,
  Uso_cavidade,
  Infraestrutura_acesso,
  Infraestrutura_interna,
  Dificuldades_progressao_interna,
  Grupo_litologico,
  Hidrologia,
  MorfologiaData,
  HidrologiaFeature,
  CavityRegisterData,
} from "../../types";
import { SuccessModal } from "../../components/modal/successModal";
import { RootState } from "../../redux/store";
import { updateCavity } from "../../db/controller";
import { showError } from "../../redux/loadingSlice";
import { NextButton } from "../../components/button/nextButton";
import { ReturnButton } from "../../components/button/returnButton";
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
import Project from "../../db/model/project";

// --- Definitions for Invertebrate Keys and Labels ---
const invertebradoKeysArray: (keyof Omit<
  Invertebrado,
  "possui" | "outroEnabled" | "outro"
>)[] = [
  "aranha",
  "acaro",
  "amblipigio",
  "opiliao",
  "pseudo_escorpiao",
  "escorpiao",
  "formiga",
  "besouro",
  "mosca",
  "mosquito",
  "mariposa",
  "barata",
  "cupim",
  "grilo",
  "percevejo",
  "piolho_de_cobra",
  "centopeia",
  "lacraia",
  "caramujo_terrestre",
  "tatuzinho_de_jardim",
];
const invertebradoDisplayToKeyMap: {
  [key: string]: keyof Omit<Invertebrado, "possui" | "outroEnabled" | "outro">;
} = {
  Aranha: "aranha",
  Ácaro: "acaro",
  Amblípigo: "amblipigio",
  Opilião: "opiliao",
  "Pseudo-escorpião": "pseudo_escorpiao",
  Escorpião: "escorpiao",
  Formiga: "formiga",
  Besouro: "besouro",
  Mosca: "mosca",
  Mosquito: "mosquito",
  Mariposa: "mariposa",
  Barata: "barata",
  Cupim: "cupim",
  Grilo: "grilo",
  Percevejo: "percevejo",
  "Piolho de cobra": "piolho_de_cobra",
  Centopeia: "centopeia",
  Lacraia: "lacraia",
  Caramujo: "caramujo_terrestre",
  "Tatuzinho de jardim": "tatuzinho_de_jardim",
};
const invertebradoLabels: Record<
  (typeof invertebradoKeysArray)[number],
  string
> = {
  aranha: "Aranha",
  acaro: "Ácaro",
  amblipigio: "Amblípigo",
  opiliao: "Opilião",
  pseudo_escorpiao: "Pseudo-escorpião",
  escorpiao: "Escorpião",
  formiga: "Formiga",
  besouro: "Besouro",
  mosca: "Mosca",
  mosquito: "Mosquito",
  mariposa: "Mariposa",
  barata: "Barata",
  cupim: "Cupim",
  grilo: "Grilo",
  percevejo: "Percevejo",
  piolho_de_cobra: "Piolho de cobra",
  centopeia: "Centopeia",
  lacraia: "Lacraia",
  caramujo_terrestre: "Caramujo terrestre",
  tatuzinho_de_jardim: "Tatuzinho de jardim",
};

const invertebradoAquaticoKeysArray: (keyof Omit<
  InvertebradoAquatico,
  "possui" | "outroEnabled" | "outro"
>)[] = ["caramujo_aquatico", "bivalve", "camarao", "caranguejo"];
const invertebradoAquaticoDisplayToKeyMap: {
  [key: string]: keyof Omit<
    InvertebradoAquatico,
    "possui" | "outroEnabled" | "outro"
  >;
} = {
  Caramujo: "caramujo_aquatico",
  Bivalve: "bivalve",
  Camarão: "camarao",
  Caranguejo: "caranguejo",
};
const invertebradoAquaticoLabels: Record<
  (typeof invertebradoAquaticoKeysArray)[number],
  string
> = {
  caramujo_aquatico: "Caramujo aquático",
  bivalve: "Bivalve",
  camarao: "Camarão",
  caranguejo: "Caranguejo",
};
// --- End Definitions for Invertebrate Keys and Labels ---

export interface StepComponentProps extends RouterProps {
  validationAttempted: boolean;
}

const isFieldFilled = (value: any): boolean => {
  if (value === null || typeof value === "undefined") return false;
  if (typeof value === "string" && value.trim() === "") return false;
  if (Array.isArray(value) && value.length === 0) return false;
  if (typeof value === "number" && isNaN(value)) return false;
  return true;
};

const validateStep = (
  /* ... Same validateStep function as in previous response ... */
  stepIndex: number,
  data: Cavidade | undefined | null
): boolean => {
  if (!data) return false;
  switch (stepIndex) {
    case 0:
      return (
        isFieldFilled(data.responsavel) &&
        isFieldFilled(data.nome_cavidade) &&
        data.municipio.length > 0 &&
        data.uf.length > 0 &&
        data.nome_sistema.length > 0 &&
        Array.isArray(data.entradas) &&
        data.entradas.length > 0 &&
        data.entradas.every((entrada) => isFieldFilled(entrada.nome))
      );
    case 1:
      const de = data.dificuldades_externas;
      if (!de) return true;
      if (de.outroEnabled === true && !isFieldFilled(de.outro)) return false;
      const specificKeysDE = Object.keys(de).filter(
        (k) => k !== "nenhuma" && k !== "outroEnabled" && k !== "outro"
      ) as (keyof Omit<
        Dificuldades_externas,
        "nenhuma" | "outroEnabled" | "outro"
      >)[];
      const algumaEspecificaMarcadaDE = specificKeysDE.some(
        (key) => de[key] === true
      );
      const outroValidoDE = de.outroEnabled === true && isFieldFilled(de.outro);
      if (de.nenhuma === true)
        return !algumaEspecificaMarcadaDE && !(de.outroEnabled === true);
      return algumaEspecificaMarcadaDE || outroValidoDE;
    case 2:
      const aspectos = data.aspectos_socioambientais;
      if (!aspectos) return true;
      if (
        aspectos.comunidade_envolvida?.envolvida === true &&
        !isFieldFilled(aspectos.comunidade_envolvida.descricao)
      )
        return false;
      const ap = aspectos.area_protegida;
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
        if (
          !federalSelected &&
          !estadualSelected &&
          !municipalSelected &&
          !naoDeterminadoSelected
        ) {
          const anyPartial =
            ap.federal?.nome ||
            ap.federal?.zona ||
            ap.estadual?.nome ||
            ap.estadual?.zona ||
            ap.municipal?.nome ||
            ap.municipal?.zona;
          if (anyPartial || !naoDeterminadoSelected) return false;
        }
      }
      if (
        aspectos.uso_cavidade?.outroEnabled === true &&
        !isFieldFilled(aspectos.uso_cavidade.outro)
      )
        return false;
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
        // if (!anyUsoSelected && usoSpecifics.length > 0) return false;
      }
      return true;
    case 3:
      const caracterizacao = data.caracterizacao_interna as
        | CaracterizacaoInterna
        | undefined;
      if (!caracterizacao) return true;
      if (caracterizacao.grupo_litologico) {
        const gl = caracterizacao.grupo_litologico;
        const hasSpecificLithology =
          gl.rochas_carbonaticas ||
          gl.rochas_ferriferas_ferruginosas ||
          gl.rochas_siliciclasticas ||
          gl.rochas_peliticas ||
          gl.rochas_granito_gnaissicas;
        if (!hasSpecificLithology && !isFieldFilled(gl.outro)) return false;
      } else return false;
      if (
        (caracterizacao.depredacao_localizada &&
          !isFieldFilled(caracterizacao.descricao_depredacao_localizada)) ||
        (caracterizacao.depredacao_intensa &&
          !isFieldFilled(caracterizacao.descricao_depredacao_intensa))
      )
        return false;
      if (!caracterizacao.desenvolvimento_predominante) return false;
      const infraInterna = caracterizacao.infraestrutura_interna;
      if (infraInterna) {
        if (infraInterna.nenhuma) {
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
          )
            return false;
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
          if (infraInterna.outroEnabled && !isFieldFilled(infraInterna.outros))
            return false;
        }
      } else return false;
      const difProg = caracterizacao.dificuldades_progressao_interna;
      if (difProg) {
        if (difProg.nenhuma) {
          const anySpecificDifProg =
            Object.keys(difProg)
              .filter((k) => k !== "nenhuma" && k !== "outro")
              .some((k) => (difProg as any)[k] === true) ||
            isFieldFilled(difProg.outro);
          if (anySpecificDifProg) return false;
        } else {
          const anySpecificDifProg = Object.keys(difProg)
            .filter((k) => k !== "nenhuma" && k !== "outro")
            .some((k) => (difProg as any)[k] === true);
          if (!anySpecificDifProg && !isFieldFilled(difProg.outro))
            return false;
        }
      } else return false;
      return true;
    case 4:
      const morfologia = data.morfologia;
      if (morfologia) {
        const pp = morfologia.padrao_planimetrico;
        if (pp) {
          const anyPPSelected = Object.keys(pp)
            .filter((k) => k !== "outro")
            .some((k) => (pp as any)[k] === true);
          if (!anyPPSelected && !isFieldFilled(pp.outro)) return false;
        } else return false;
        const fs = morfologia.forma_secoes;
        if (fs) {
          const anyFSSelected = Object.keys(fs)
            .filter((k) => k !== "outro")
            .some((k) => (fs as any)[k] === true);
          if (!anyFSSelected && !isFieldFilled(fs.outro)) return false;
        } else return false;
      }
      return true;
      case 5:
        const hydro = data.hidrologia;
        if (!hydro) return false;
  
        const checkWaterFeature = (feature?: {
          possui?: boolean;
          tipo?: string;
        }) => feature?.possui && isFieldFilled(feature.tipo);
  
        const features = [
          hydro.curso_agua,
          hydro.lago,
          hydro.sumidouro,
          hydro.surgencia,
          hydro.gotejamento,
          hydro.condensacao,
          hydro.empossamento,
          hydro.exudacao,
        ];
  
        // Ensure all features are filled if 'possui' is true
        if (!features.every(checkWaterFeature)) return false;
  
        // Ensure 'outro' is filled if enabled
        if (hydro.hasOwnProperty("outro") && !isFieldFilled(hydro.outro))
          return false;
  
        return true;
    case 6:
      const sed = data.sedimentos;
      if (!sed) return true;
      let isClasticaValid = true;
      if (sed.sedimentacao_clastica?.possui) {
        const clastica = sed.sedimentacao_clastica;
        let algumaSubOpcaoClasticaValida = false;
        if (clastica.tipo) {
          const checkGrain = (g?: any) =>
            g && isFieldFilled(g.distribuicao) && isFieldFilled(g.origem);
          if (
            clastica.tipo.rochoso ||
            checkGrain(clastica.tipo.argila) ||
            checkGrain(clastica.tipo.silte) ||
            checkGrain(clastica.tipo.areia) ||
            checkGrain(clastica.tipo.fracao_granulo) ||
            checkGrain(clastica.tipo.seixo_predominante) ||
            checkGrain(clastica.tipo.fracao_calhau) ||
            checkGrain(clastica.tipo.matacao_predominante)
          )
            algumaSubOpcaoClasticaValida = true;
        }
        if (clastica.outroEnabled) {
          if (isFieldFilled(clastica.outros))
            algumaSubOpcaoClasticaValida = true;
          else isClasticaValid = false;
        }
        if (!algumaSubOpcaoClasticaValida && isClasticaValid)
          isClasticaValid = false;
      }
      let isOrganicaValid = true;
      if (sed.sedimentacao_organica?.possui) {
        const organica = sed.sedimentacao_organica;
        let algumaSubOpcaoOrganicaValida = false;
        if (organica.tipo) {
          const ot = organica.tipo;
          if (
            ot.guano &&
            ((ot.guano.carnivoro?.possui &&
              isFieldFilled(ot.guano.carnivoro.tipo)) ||
              (ot.guano.frugivoro?.possui &&
                isFieldFilled(ot.guano.frugivoro.tipo)) ||
              (ot.guano.hematofago?.possui &&
                isFieldFilled(ot.guano.hematofago.tipo)) ||
              (ot.guano.inderterminado?.possui &&
                isFieldFilled(ot.guano.inderterminado.tipo)))
          )
            algumaSubOpcaoOrganicaValida = true;
          if (
            ot.folhico ||
            ot.galhos ||
            ot.raizes ||
            ot.vestigios_ninhos ||
            ot.pelotas_regurgitacao
          )
            algumaSubOpcaoOrganicaValida = true;
        }
        if (organica.outroEnabled) {
          if (isFieldFilled(organica.outros))
            algumaSubOpcaoOrganicaValida = true;
          else isOrganicaValid = false;
        }
        if (!algumaSubOpcaoOrganicaValida && isOrganicaValid)
          isOrganicaValid = false;
      }
      if (
        sed.sedimentacao_clastica?.possui === false &&
        sed.sedimentacao_organica?.possui === false
      ) {
      } else if (sed.sedimentacao_clastica?.possui && !isClasticaValid)
        return false;
      else if (sed.sedimentacao_organica?.possui && !isOrganicaValid)
        return false;
      else if (
        !(
          sed.sedimentacao_clastica?.possui || sed.sedimentacao_organica?.possui
        ) &&
        (sed.hasOwnProperty("sedimentacao_clastica") ||
          sed.hasOwnProperty("sedimentacao_organica"))
      ) {
        if (
          sed.sedimentacao_clastica !== undefined ||
          sed.sedimentacao_organica !== undefined
        ) {
          if (
            !(
              sed.sedimentacao_clastica?.possui === false &&
              sed.sedimentacao_organica?.possui === false
            ) &&
            !(sed.sedimentacao_clastica?.possui === true && isClasticaValid) &&
            !(sed.sedimentacao_organica?.possui === true && isOrganicaValid)
          ) {
            return false;
          }
        }
      }
      return true;
    case 7:
      const esp = data.espeleotemas;
      if (!esp || esp.possui === false) return false;
      if (!Array.isArray(esp.tipos) || esp.tipos.length === 0) return false;
      return esp.tipos.every(
        (item) =>
          isFieldFilled(item.tipo) &&
          isFieldFilled(item.porte) &&
          isFieldFilled(item.frequencia) &&
          isFieldFilled(item.estado_conservacao)
      );
    case 8:
      const biota = data.biota;
      if (!biota) return true;
      const checkBooleans = (cat?: any) =>
        !cat ||
        cat.possui === false ||
        ((Object.keys(cat)
          .filter(
            (k) => k !== "possui" && k !== "outroEnabled" && k !== "outro"
          )
          .some((k) => cat[k]) ||
          (cat.outroEnabled && isFieldFilled(cat.outro))) &&
          !(cat.outroEnabled && !isFieldFilled(cat.outro)));
      const checkStandard = (cat?: any) =>
        !cat ||
        cat.possui === false ||
        (((Array.isArray(cat.tipos) && cat.tipos.length > 0) ||
          (cat.outroEnabled && isFieldFilled(cat.outro))) &&
          !(cat.outroEnabled && !isFieldFilled(cat.outro)));
      const checkBats = (m?: any) =>
        !m ||
        m.possui === false ||
        (Array.isArray(m.tipos) &&
          m.tipos.length > 0 &&
          m.tipos.every(
            (i: any) => isFieldFilled(i.tipo) && isFieldFilled(i.quantidade)
          ));
      return (
        checkBooleans(biota.invertebrado) &&
        checkBooleans(biota.invertebrado_aquatico) &&
        checkStandard(biota.anfibios) &&
        checkStandard(biota.repteis) &&
        checkStandard(biota.aves) &&
        checkBats(biota.morcegos)
      );
    case 9:
      const validateArch = (s?: any) =>
        !s ||
        s.possui === false ||
        (s.tipos &&
          (Object.keys(s.tipos)
            .filter((k) => k !== "outroEnabled" && k !== "outro")
            .some((k) => s.tipos[k]) ||
            (s.tipos.outroEnabled && isFieldFilled(s.tipos.outro))) &&
          !(s.tipos.outroEnabled && !isFieldFilled(s.tipos.outro)));
      return validateArch(data.arqueologia) && validateArch(data.paleontologia);
    default:
      return true;
  }
};

const EditCavity: FC<RouterProps> = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const [successSuccessModal, setSuccessModal] = useState(false);
  const [errorLoading, setErrorLoading] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const { currentStep, formData } = useSelector((state: RootState) => ({
    currentStep: state.cavity.currentStep,
    formData: state.cavity.cavidade,
  }));
  const [validationAttempted, setValidationAttempted] = useState(false);
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
  const StepComponent: FC<StepComponentProps> | undefined = steps[currentStep];

  const isCurrentStepValid = useMemo(
    () => validateStep(currentStep, formData),
    [currentStep, formData]
  );

  const fetchCavity = useCallback(async () => {
    const cavityId = route.params?.cavityId;
    console.log("[EditCavity] Attempting to fetch cavity with ID:", cavityId);

    if (!cavityId) {
      setErrorLoading("ID da cavidade não fornecido para edição.");
      setIsLoading(false);
      dispatch(resetCavidadeState());
      dispatch(updateCurrentStep(0));
      return;
    }

    setIsLoading(true);
    setErrorLoading(null);
    try {
      const cavityCollection =
        database.collections.get<CavityRegister>("cavity_register");
      const foundCavityModel = await cavityCollection.find(cavityId);
      console.log(
        "[EditCavity] Found cavity model in DB:",
        !!foundCavityModel,
        "Name:",
        foundCavityModel.nome_cavidade
      );

      const safeJsonParse = (
        jsonString: string | null | undefined,
        defaultValue: any = {}
      ) => {
        if (jsonString === null || typeof jsonString === "undefined")
          return JSON.parse(JSON.stringify(defaultValue));
        try {
          return JSON.parse(jsonString);
        } catch (e) {
          console.warn(
            "EditCavity: Failed to parse JSON for field, returning default. String:",
            jsonString,
            "Error:",
            e
          );
          return JSON.parse(JSON.stringify(defaultValue));
        }
      };

      // Define local defaults mirroring initial state structures from cavitySlice.ts
      const defaultDificuldadesExternas: Dificuldades_externas = {
        nenhuma: true,
        rastejamento: false,
        quebra_corpo: false,
        teto_baixo: false,
        natacao: false,
        sifao: false,
        blocos_instaveis: false,
        lances_verticais: false,
        cachoeira: false,
        trechos_escorregadios: false,
        passagem_curso_agua: false,
        outroEnabled: false,
        outro: undefined,
      };
      const defaultAspectosSocioambientais: AspectosSocioambientais = {
        uso_cavidade: {
          religioso: false,
          cientifico_cultural: false,
          social: false,
          minerario: false,
          pedagogico: false,
          esportivo: false,
          turistico: false,
          incipiente: false,
          massa: false,
          aventura: false,
          mergulho: false,
          rapel: false,
          outroEnabled: false,
          outro: undefined,
        },
        comunidade_envolvida: { envolvida: false, descricao: undefined },
        area_protegida: {
          nao_determinado: true,
          federal: undefined,
          estadual: undefined,
          municipal: undefined,
        },
        infraestrutura_acesso: {
          nenhuma: true,
          receptivo: false,
          condutor_para_visitantes: false,
          lanchonete_ou_restaurante: false,
          pousada_ou_hotel: false,
        },
      };
      const defaultCaracterizacaoInterna: CaracterizacaoInterna = {
        grupo_litologico: {
          rochas_carbonaticas: false,
          rochas_ferriferas_ferruginosas: false,
          rochas_siliciclasticas: false,
          rochas_peliticas: false,
          rochas_granito_gnaissicas: false,
          outro: undefined,
        },
        desenvolvimento_predominante: undefined,
        depredacao_localizada: false,
        descricao_depredacao_localizada: undefined,
        depredacao_intensa: false,
        descricao_depredacao_intensa: undefined,
        infraestrutura_interna: {
          nenhuma: true,
          passarela: false,
          portao: false,
          escada: false,
          corda: false,
          iluminacao_artificial: false,
          ponto_ancoragem: false,
          corrimao: undefined,
          outroEnabled: false,
          outros: undefined,
        },
        dificuldades_progressao_interna: {
          nenhuma: true,
          teto_baixo: false,
          blocos_instaveis: false,
          trechos_escorregadios: false,
          rastejamento: false,
          natacao: false,
          lances_verticais: false,
          passagem_curso_agua: false,
          quebra_corpo: false,
          sifao: false,
          cachoeira: false,
          outro: undefined,
        },
      };
      const defaultBiota: Biota = {
        invertebrado: {
          possui: false,
          aranha: false,
          acaro: false,
          amblipigio: false,
          opiliao: false,
          pseudo_escorpiao: false,
          escorpiao: false,
          formiga: false,
          besouro: false,
          mosca: false,
          mosquito: false,
          mariposa: false,
          barata: false,
          cupim: false,
          grilo: false,
          percevejo: false,
          piolho_de_cobra: false,
          centopeia: false,
          lacraia: false,
          caramujo_terrestre: false,
          tatuzinho_de_jardim: false,
          outroEnabled: false,
          outro: undefined,
        },
        invertebrado_aquatico: {
          possui: false,
          caramujo_aquatico: false,
          bivalve: false,
          camarao: false,
          caranguejo: false,
          outroEnabled: false,
          outro: undefined,
        },
        anfibios: {
          possui: false,
          tipos: [],
          outroEnabled: false,
          outro: undefined,
        },
        repteis: {
          possui: false,
          tipos: [],
          outroEnabled: false,
          outro: undefined,
        },
        aves: {
          possui: false,
          tipos: [],
          outroEnabled: false,
          outro: undefined,
        },
        peixes: false,
        morcegos: { possui: false, tipos: [], observacoes_gerais: undefined },
      };
      const defaultSedimentos: Sedimentos = {
        sedimentacao_clastica: { possui: false, tipo: {} },
        sedimentacao_organica: { possui: false, tipo: {} },
      };
      const defaultEspeleotemas: Espeleotemas = { possui: false, tipos: [] };
      const defaultArqueologia: Arqueologia = {
        possui: false,
        tipos: { outroEnabled: false },
      };
      const defaultPaleontologia: Paleontologia = {
        possui: false,
        tipos: { outroEnabled: false },
      };

      const caracterizacaoInternaDb = safeJsonParse(
        foundCavityModel.caracterizacao_interna,
        defaultCaracterizacaoInterna
      );
      const newCaracterizacaoInterna: CaracterizacaoInterna = {
        ...caracterizacaoInternaDb,
      };

      const biotaDbParsed = safeJsonParse(foundCavityModel.biota, defaultBiota);
      const transformedBiota: Biota = JSON.parse(JSON.stringify(defaultBiota));
      Object.keys(defaultBiota).forEach((key) => {
        if (
          biotaDbParsed.hasOwnProperty(key) &&
          key !== "invertebrados" &&
          key !== "invertebrados_aquaticos" &&
          key !== "invertebrado" &&
          key !== "invertebrado_aquatico"
        ) {
          (transformedBiota as any)[key] = biotaDbParsed[key];
        }
      });
      if (
        biotaDbParsed.invertebrados &&
        Array.isArray(biotaDbParsed.invertebrados.tipos)
      ) {
        const inv: Invertebrado = {
          ...defaultBiota.invertebrado!,
          possui: biotaDbParsed.invertebrados.possui ?? false,
          outroEnabled: biotaDbParsed.invertebrados.outroEnabled ?? false,
          outro: biotaDbParsed.invertebrados.outro,
        };
        invertebradoKeysArray.forEach((k) => {
          const old =
            invertebradoDisplayToKeyMap[k] ||
            k.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
          (inv as any)[k] =
            biotaDbParsed.invertebrados.tipos.includes(old) ||
            biotaDbParsed.invertebrados.tipos.includes(k);
        });
        transformedBiota.invertebrado = inv;
      } else if (
        biotaDbParsed.invertebrado &&
        typeof biotaDbParsed.invertebrado === "object"
      ) {
        transformedBiota.invertebrado = {
          ...defaultBiota.invertebrado!,
          ...biotaDbParsed.invertebrado,
        };
      }
      if (
        biotaDbParsed.invertebrados_aquaticos &&
        Array.isArray(biotaDbParsed.invertebrados_aquaticos.tipos)
      ) {
        const invAq: InvertebradoAquatico = {
          ...defaultBiota.invertebrado_aquatico!,
          possui: biotaDbParsed.invertebrados_aquaticos.possui ?? false,
          outroEnabled:
            biotaDbParsed.invertebrados_aquaticos.outroEnabled ?? false,
          outro: biotaDbParsed.invertebrados_aquaticos.outro,
        };
        invertebradoAquaticoKeysArray.forEach((k) => {
          const old =
            invertebradoAquaticoDisplayToKeyMap[k] ||
            k.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
          (invAq as any)[k] =
            biotaDbParsed.invertebrados_aquaticos.tipos.includes(old) ||
            biotaDbParsed.invertebrados_aquaticos.tipos.includes(k);
        });
        transformedBiota.invertebrado_aquatico = invAq;
      } else if (
        biotaDbParsed.invertebrado_aquatico &&
        typeof biotaDbParsed.invertebrado_aquatico === "object"
      ) {
        transformedBiota.invertebrado_aquatico = {
          ...defaultBiota.invertebrado_aquatico!,
          ...biotaDbParsed.invertebrado_aquatico,
        };
      }

      const formattedData: Cavidade = {
        registro_id: foundCavityModel.registro_id,
        projeto_id: foundCavityModel.projeto_id || "",
        responsavel: foundCavityModel.responsavel || "",
        nome_cavidade: foundCavityModel.nome_cavidade || "",
        nome_sistema: foundCavityModel.nome_sistema || "",
        data: formatDateToInput(
          foundCavityModel.data || new Date().toISOString()
        ),
        municipio: foundCavityModel.municipio || "",
        uf: foundCavityModel.uf || "",
        localidade: foundCavityModel.localidade || undefined,
        desenvolvimento_linear:
          foundCavityModel.desenvolvimento_linear ?? undefined,
        entradas: safeJsonParse(foundCavityModel.entradas, []),
        dificuldades_externas: safeJsonParse(
          foundCavityModel.dificuldades_externas,
          defaultDificuldadesExternas
        ),
        aspectos_socioambientais: safeJsonParse(
          foundCavityModel.aspectos_socioambientais,
          defaultAspectosSocioambientais
        ),
        caracterizacao_interna: newCaracterizacaoInterna,
        topografia: safeJsonParse(foundCavityModel.topografia, {
          espeleometria: {},
          previsao: {},
        }),
        morfologia: safeJsonParse(foundCavityModel.morfologia, {
          padrao_planimetrico: {},
          forma_secoes: {},
        }),
        hidrologia: safeJsonParse(foundCavityModel.hidrologia, {}),
        sedimentos: safeJsonParse(
          foundCavityModel.sedimentos,
          defaultSedimentos
        ),
        espeleotemas: safeJsonParse(
          foundCavityModel.espeleotemas,
          defaultEspeleotemas
        ),
        biota: transformedBiota,
        arqueologia: safeJsonParse(
          foundCavityModel.arqueologia,
          defaultArqueologia
        ),
        paleontologia: safeJsonParse(
          foundCavityModel.paleontologia,
          defaultPaleontologia
        ),
      };
      console.log(
        "[EditCavity] Dispatching setFullInfos with registro_id:",
        formattedData.registro_id
      );
      dispatch(setFullInfos(formattedData));

      // Fetch project separately if projeto_id exists on the raw model
      // This part was correct and should remain to set the 'project' state variable.
      if (foundCavityModel.projeto_id) {
        const projectCollection = database.collections.get<Project>("project");
        try {
          const foundProject = await projectCollection.find(
            foundCavityModel.projeto_id
          );
          console.log(
            "[EditCavity] Fetched project:",
            foundProject?.nome_projeto
          );
          setProject(foundProject);
        } catch (projectError) {
          console.warn(
            `[EditCavity] Project with ID ${foundCavityModel.projeto_id} not found.`,
            projectError
          );
          setProject(null);
        }
      } else {
        console.log("[EditCavity] No projeto_id found on cavity model.");
        setProject(null);
      }
    } catch (err) {
      console.error("[EditCavity] Error in fetchCavity's try block:", err);
      setErrorLoading("Erro ao carregar detalhes da cavidade para edição.");
      dispatch(resetCavidadeState()); // Clear form data on error
    } finally {
      console.log(
        "[EditCavity] fetchCavity finally block, setIsLoading(false)"
      );
      setIsLoading(false);
    }
  }, [route.params?.cavityId, dispatch]);

  useFocusEffect(
    useCallback(() => {
      const cavityId = route.params?.cavityId;
      console.log("[EditCavity] Screen Focused. Cavity ID:", cavityId);
      if (cavityId) {
        // It's important that fetchCavity itself doesn't cause an infinite loop
        // by changing its own dependencies in a way that re-triggers useFocusEffect.
        // Current dependencies of fetchCavity (route.params.cavityId, dispatch) are fine.
        fetchCavity();
      } else {
        setErrorLoading("ID da cavidade não disponível ao focar na tela.");
        setIsLoading(false);
        dispatch(resetCavidadeState());
        dispatch(updateCurrentStep(0));
      }

      return () => {
        console.log(
          "[EditCavity] Screen blurred or unmounted. Resetting state."
        );
        dispatch(resetCavidadeState());
        dispatch(updateCurrentStep(0));
      };
    }, [route.params?.cavityId, fetchCavity, dispatch])
  );

  const handleHardwareBackPress = useCallback(() => {
    Alert.alert(
      "Sair da Edição?",
      "Alterações não salvas serão perdidas. Deseja continuar?",
      [
        { text: "Cancelar", style: "cancel", onPress: () => {} },
        {
          text: "Sair",
          style: "destructive",
          onPress: () => {
            navigation.navigate("CavityScreen");
            // No need to dispatch resetCavidadeState here,
            // useFocusEffect's cleanup will handle it when the screen blurs/unmounts.
          },
        },
      ]
    );
    return true;
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      BackHandler.addEventListener(
        "hardwareBackPress",
        handleHardwareBackPress
      );
      return () =>
        BackHandler.removeEventListener(
          "hardwareBackPress",
          handleHardwareBackPress
        );
    }, [handleHardwareBackPress])
  );

  const handleNext = async () => {
    setValidationAttempted(true);
    const isValidOnClick = validateStep(currentStep, formData);
    if (!isValidOnClick) {
      Alert.alert(
        "Campos Obrigatórios",
        "Por favor, preencha todos os campos obrigatórios corretamente."
      );
      if (scrollViewRef.current)
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      return;
    }
    setValidationAttempted(false);

    if (currentStep === steps.length - 1) {
      const cavityIdToUpdate = route?.params?.cavityId;
      if (!cavityIdToUpdate || !formData || !formData.registro_id) {
        dispatch(
          showError({
            title: "Erro ao Editar",
            message: "Dados da cavidade ou ID não encontrado.",
          })
        );
        return;
      }
      try {
        console.log(formData.caracterizacao_interna);
        const payloadForUpdate: Partial<
          Omit<CavityRegisterData, "registro_id">
        > = {
          responsavel: formData.responsavel,
          projeto_id: formData.projeto_id || "",
          nome_cavidade: formData.nome_cavidade,
          nome_sistema: formData.nome_sistema,
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
                  )
                    throw new Error("Data inválida");
                  return formatDateToInput(
                    new Date(y, m - 1, d, 12, 0, 0, 0).toISOString()
                  );
                } catch (e) {
                  return formatDateToInput(new Date().toISOString());
                }
              })()
            : formatDateToInput(new Date().toISOString()),
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
        };
        await updateCavity(cavityIdToUpdate, payloadForUpdate);
        setSuccessModal(true);
      } catch (err) {
        dispatch(
          showError({
            title: "Erro ao editar",
            message: err instanceof Error ? err.message : "Erro desconhecido.",
          })
        );
      }
    } else {
      dispatch(updateCurrentStep(currentStep + 1));
      if (scrollViewRef.current)
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const handleBack = () => {
    setValidationAttempted(false);
    if (currentStep === 0) handleHardwareBackPress();
    else {
      dispatch(updateCurrentStep(currentStep - 1));
      if (scrollViewRef.current)
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
    }
  };

  const handleSuccessModalClose = () => {
    setSuccessModal(false);
    // State reset is handled by useFocusEffect's cleanup when navigating away
    navigation.navigate("CavityScreen");
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent[100]} />
        <Divider />
        <TextInter color={colors.white[100]} weight="medium">
          Carregando detalhes...
        </TextInter>
      </SafeAreaView>
    );
  }

  if (errorLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <Header
          title="Erro"
          onCustomReturn={() => {
            dispatch(resetCavidadeState());
            navigation.navigate("CavityScreen");
          }}
        />
        <Divider />
        <TextInter
          color={colors.error[100]}
          style={{ marginTop: 20, textAlign: "center", paddingHorizontal: 20 }}
        >
          {errorLoading}
        </TextInter>
      </SafeAreaView>
    );
  }

  // Check formData and a key mandatory field like registro_id after loading and no error
  if (!formData || !formData.registro_id) {
    console.log(
      "[EditCavity] Render: formData or formData.registro_id is missing after loading. formData:",
      formData
    );
    return (
      <SafeAreaView style={styles.centered}>
        <Header title="Editar Caverna" onCustomReturn={handleBack} />
        <TextInter color={colors.white[100]} style={{ marginTop: 20 }}>
          Dados da cavidade não disponíveis. Tente novamente.
        </TextInter>
      </SafeAreaView>
    );
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
          <Header title="Editar Caverna" onCustomReturn={handleBack} />
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
                currentStep === steps.length - 1
                  ? "Salvar Edições"
                  : "Continuar"
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
  main: { backgroundColor: colors.dark[90], flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 25,
  },
  stepContainer: { flex: 1, width: "100%", marginBottom: 20 },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: "auto",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.dark[90],
    paddingHorizontal: 20,
  },
});
