import {
  ActivityIndicator,
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
import {
  resetCavidadeState,
  setFullInfos,
  updateCurrentStep,
} from "../../redux/cavitySlice";
import { useSelector, useDispatch } from "react-redux";
import { Header } from "../../components/header";
import TextInter from "../../components/textInter";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Biota, Cavidade, Dificuldades_externas, RouterProps } from "../../types"; // RouterProps é importado
import { SuccessModal } from "../../components/modal/successModal";
import { RootState } from "../../redux/store";
import { updateCavity } from "../../db/controller"; // updateCavity é usado aqui
import { showError } from "../../redux/loadingSlice";
import { NextButton } from "../../components/button/nextButton";
import { ReturnButton } from "../../components/button/returnButton";
// uuid não é necessário para edição, a menos que esteja criando algo novo dentro da edição
import { StepOne } from "./stepOne";
import { StepTwo } from "./stepTwo";
import StepThree from "./stepThree"; // Verifique se a importação default está correta
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

// Definindo StepComponentProps aqui, ou importe de types.ts se estiver lá
export interface StepComponentProps extends RouterProps {
  validationAttempted: boolean;
}

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

// A função validateStep permanece a mesma que você forneceu
const validateStep = (
  stepIndex: number,
  data: Cavidade | undefined | null
): boolean => {
  if (!data) return false;

  switch (stepIndex) {
    case 0: // Step One: Basic Info
      return (
        isFilled(data.projeto_id) &&
        isFilled(data.responsavel) &&
        isFilled(data.nome_cavidade) &&
        Array.isArray(data.entradas) &&
        data.entradas.length > 0
      );
      case 1: // Step Two: Desenvolvimento Linear e Dificuldades Externas
      const de = data.dificuldades_externas;
      if (!de) return false;
      if (de.outroEnabled === true && !isFilled(de.outro)) {
        return false;
      }
      const specificKeys: (keyof Omit<Dificuldades_externas, "nenhuma" | "outroEnabled" | "outro">)[] = [
        "rastejamento", "quebra_corpo", "teto_baixo", "natacao", "sifao",
        "blocos_instaveis", "lances_verticais", "cachoeira",
        "trechos_escorregadios", "passagem_curso_agua",
      ];
      const algumaEspecificaMarcada = specificKeys.some(key => de[key] === true);
      const outroValido = de.outroEnabled === true && isFilled(de.outro);

      if (!algumaEspecificaMarcada && !outroValido && de.nenhuma !== true) {
        return false;
      }
      // Se "Nenhum" está marcado, nenhuma outra dificuldade (incluindo "Outro") deve estar ativa.
      // A lógica no componente StepTwo já deve tratar isso ao marcar "Nenhum".
      // Mas uma verificação final aqui pode ser útil.
      if (de.nenhuma === true && (algumaEspecificaMarcada || de.outroEnabled === true)) {
          // Este caso indica uma inconsistência no estado, pois "Nenhum" não deveria estar
          // ativo junto com outras dificuldades. A lógica do componente deve prevenir isso.
          // console.warn("Inconsistent state: 'Nenhum' is true along with other difficulties.");
          // return false; // Descomente se quiser falhar a validação neste caso de inconsistência.
      }
      return true;

      case 2: // Step Three: Aspectos Socioambientais
      const aspectos = data.aspectos_socioambientais;
      if (!aspectos) return true;

      if (aspectos.comunidade_envolvida?.envolvida === true) {
        if (!isFilled(aspectos.comunidade_envolvida.descricao)) {
          return false;
        }
      }

      const ap = aspectos.area_protegida;
      if (ap) {
        const isFederalSelected = ap.federal && isFilled(ap.federal.nome);
        const isEstadualSelected = ap.estadual && isFilled(ap.estadual.nome);
        const isMunicipalSelected = ap.municipal && isFilled(ap.municipal.nome);
        const isNenhumaOuNaoDeterminado =
          ap.nao_determinado === true ||
          (!ap.federal && !ap.estadual && !ap.municipal);

        if (ap.federal && !isFilled(ap.federal.nome)) return false;
        if (ap.estadual && !isFilled(ap.estadual.nome)) return false;
        if (ap.municipal && !isFilled(ap.municipal.nome)) return false;
      }

      if (aspectos.uso_cavidade?.outroEnabled === true) {
        if (!isFilled(aspectos.uso_cavidade.outro)) {
          return false;
        }
      }
      return true;
      case 3: // Step Four: Caracterização Interna (onde estão as regras que mencionou)
      const caracterizacao = data.caracterizacao_interna;
      if (!caracterizacao) return true; 

      if (caracterizacao.grupo_litologico) {
        if (caracterizacao.grupo_litologico.outro !== undefined && !isFilled(caracterizacao.grupo_litologico.outro)) {
          return false;
        }
      }

      if ((caracterizacao.estado_conservacao === "Depredação localizada" || caracterizacao.estado_conservacao === "Depredação intensa") &&
          !isFilled(caracterizacao.estado_conservacao_detalhes)) { 
          return false;
      }

      const infraInterna = caracterizacao.infraestrutura_interna;
      if (infraInterna) { 
          if (infraInterna.corrimao) {
              const corrimaoInfo = infraInterna.corrimao;
              const isOutroCorrimaoTextFilledAndActive = corrimaoInfo.outro !== undefined && isFilled(corrimaoInfo.outro);
              const algumaOpcaoCorrimaoFilhoSelecionada = 
                  corrimaoInfo.ferro === true ||
                  corrimaoInfo.madeira === true ||
                  corrimaoInfo.corda === true ||
                  isOutroCorrimaoTextFilledAndActive;
              
              if (!algumaOpcaoCorrimaoFilhoSelecionada) {
                return false;
              }
          }

          if (infraInterna.outroEnabled === true && !isFilled(infraInterna.outros)) {
              return false;
          }
      }
      
      const dificuldadeProg = caracterizacao.dificuldades_progressao_interna;
      if (dificuldadeProg) { 
          if (dificuldadeProg.outro !== undefined && !isFilled(dificuldadeProg.outro)) {
              return false;
          }
      }
      
      return true;

    case 4: // Step Five: Topografia e Morfologia
      const morfologia = data.morfologia;
      if (morfologia) {
        if (
          morfologia.padrao_planimetrico?.outro !== undefined &&
          !isFilled(morfologia.padrao_planimetrico.outro)
        ) {
          return false;
        }
        if (
          morfologia.forma_secoes?.outro !== undefined &&
          !isFilled(morfologia.forma_secoes.outro)
        ) {
          return false;
        }
      }
      return true;

    case 5: // Step Six: Hidrologia
      const hydro = data.hidrologia;
      if (!hydro) return true; // Se a seção Hidrologia for opcional e não preenchida.

      const checkWaterFeature = (feature?: {
        possui?: boolean;
        tipo?: "perene" | "intermitente" | "nao_soube_informar";
      }) => {
        return !feature?.possui || isFilled(feature.tipo);
      };

      const allFeaturesValid =
        checkWaterFeature(hydro.curso_agua) &&
        checkWaterFeature(hydro.lago) &&
        checkWaterFeature(hydro.sumidouro) &&
        checkWaterFeature(hydro.surgencia) &&
        checkWaterFeature(hydro.gotejamento) &&
        checkWaterFeature(hydro.condensacao) &&
        checkWaterFeature(hydro.empossamento) &&
        checkWaterFeature(hydro.exudacao);
      const isOutroHidrologiaValid =
        hydro.outro === undefined || isFilled(hydro.outro);

      return allFeaturesValid && isOutroHidrologiaValid;

    case 6: // Step Seven: Sedimentos
      const sed = data.sedimentos;
      if (!sed) return true;

      let isClasticaValid = true;
      if (sed.sedimentacao_clastica?.possui) {
        const clastica = sed.sedimentacao_clastica;
        if (!clastica) {
          isClasticaValid = false;
        } else {
          let algumaSubOpcaoClasticaValida = false;
          if (clastica.tipo?.rochoso) {
            const clasticaTipo = clastica.tipo;
            const checkGrainSize = (grain?: {
              distribuicao?: string;
              origem?: string;
            }) =>
              grain
                ? isFilled(grain.distribuicao) && isFilled(grain.origem)
                : false;

            if (
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
            ) {
              algumaSubOpcaoClasticaValida = true;
            }
          }

          if (clastica.outroEnabled) {
            if (isFilled(clastica.outros)) {
              algumaSubOpcaoClasticaValida = true;
            }
          }
          isClasticaValid = algumaSubOpcaoClasticaValida;
        }
      }

      let isOrganicaValid = true;
      if (sed.sedimentacao_organica?.possui) {
        const organica = sed.sedimentacao_organica;
        if (!organica) {
          isOrganicaValid = false;
        } else {
          const orgTipo = organica.tipo;
          let algumaSubOpcaoOrganicaValida = false;

          if (orgTipo?.guano) {
            const guano = orgTipo.guano;
            if (
              (guano.carnivoro?.possui && isFilled(guano.carnivoro.tipo)) ||
              (guano.frugivoro?.possui && isFilled(guano.frugivoro.tipo)) ||
              (guano.hematofago?.possui && isFilled(guano.hematofago.tipo)) ||
              (guano.inderterminado?.possui &&
                isFilled(guano.inderterminado.tipo))
            ) {
              algumaSubOpcaoOrganicaValida = true;
            }
          }
          if (
            orgTipo?.folhico ||
            orgTipo?.galhos ||
            orgTipo?.raizes ||
            orgTipo?.vestigios_ninhos ||
            orgTipo?.pelotas_regurgitacao
          ) {
            algumaSubOpcaoOrganicaValida = true;
          }

          if (organica.outroEnabled) {
            if (isFilled(organica.outros)) {
              algumaSubOpcaoOrganicaValida = true;
            }
          }
          isOrganicaValid = algumaSubOpcaoOrganicaValida;
        }
      }
      return isClasticaValid && isOrganicaValid;

    case 7: // Step Eight: Espeleotemas
      const esp = data.espeleotemas;
      if (!esp || typeof esp.possui === "undefined") {
        return true;
      }
      // Se 'possui' é true, a lista de espeleotemas não deve estar vazia.
      if (esp.possui === true) {
        if (!Array.isArray(esp.lista) || esp.lista.length === 0) {
          return false;
        }
        // Opcional: Validar se cada item na lista tem 'tipo' preenchido, se essa for uma regra.
        // const todosItensValidos = esp.lista.every(item => isFilled(item.tipo));
        // if (!todosItensValidos) return false;
      }
      return true;

      case 8: // Step Nine: Biota
      const biota = data.biota;
      if (!biota) return true; 
      
      const checkBiotaFeature = (feature?: {
        possui?: boolean;
        tipos?: string[];
        outroEnabled?: boolean; 
        outro?: string;
      }) => {
        if (!feature) return true; 
        if (!feature.possui) return true; // Se 'possui' for false, é válido

        // Se 'possui' é true, a lógica abaixo se aplica:
        const tiposValidos = Array.isArray(feature.tipos) && feature.tipos.length > 0;
        
        if (typeof feature.outroEnabled === 'boolean') { 
          if (feature.outroEnabled) {
            // Se 'outro' está habilitado, DEVE estar preenchido.
            // E, ou os tipos são válidos OU o outro (já validado como preenchido) é a única opção.
            // A questão é se 'tiposValidos' E 'outroValido' podem coexistir ou se são mutuamente exclusivos.
            // Assumindo que podem coexistir, mas se 'outroEnabled' é true, 'outro' DEVE ser preenchido.
            if (!isFilled(feature.outro)) return false; // Falha se 'outroEnabled' mas 'outro' vazio
            return tiposValidos || isFilled(feature.outro); // Válido se tipos OU o outro (que sabemos estar preenchido) for válido
          } else {
            // Se 'outro' não está habilitado, apenas 'tiposValidos' importa.
            return tiposValidos;
          }
        }
        // Fallback se 'outroEnabled' não existir (lógica original)
        return tiposValidos || isFilled(feature.outro); 
      };

      const checkMorcegos = (morcegos?: Biota["morcegos"]) => {
        if (!morcegos?.possui) return true;
        if (!morcegos || !Array.isArray(morcegos.tipos) || morcegos.tipos.length === 0) return false;
        return morcegos.tipos.every( (m) => isFilled(m.tipo) && isFilled(m.quantidade) );
      };

      const peixesValido = biota.peixes === undefined || typeof biota.peixes === 'boolean';

      return (
        checkBiotaFeature(biota.invertebrados) &&
        checkBiotaFeature(biota.invertebrados_aquaticos) &&
        checkBiotaFeature(biota.anfibios) &&
        checkBiotaFeature(biota.repteis) &&
        checkBiotaFeature(biota.aves) &&
        checkMorcegos(biota.morcegos) &&
        peixesValido 
      );

      case 9: // Step Ten: Arqueologia & Paleontologia
      const validateArchPalSection = (sectionData?: {
        possui?: boolean;
        tipos?: {
          [key: string]: boolean | string | undefined;
          outroEnabled?: boolean;
          outro?: string;
        };
      }): boolean => {
        if (!sectionData || typeof sectionData.possui === "undefined")
          return true;
        if (!sectionData.possui) return true;

        if (!sectionData.tipos) return false;

        const tipos = sectionData.tipos;

        if (tipos.outroEnabled === true && !isFilled(tipos.outro)) {
          return false;
        }

        let hasSpecificTypeBoolean = false;
        for (const key in tipos) {
          if (
            key !== "outroEnabled" &&
            key !== "outro" &&
            typeof tipos[key] === "boolean" &&
            tipos[key] === true
          ) {
            hasSpecificTypeBoolean = true;
            break;
          }
        }

        const outroPreenchidoCorretamente =
          tipos.outroEnabled === true && isFilled(tipos.outro);

        if (
          tipos.outroEnabled === false ||
          typeof tipos.outroEnabled === "undefined"
        ) {
          return hasSpecificTypeBoolean;
        }

        return hasSpecificTypeBoolean || outroPreenchidoCorretamente;
      };

      return (
        validateArchPalSection(data.arqueologia) &&
        validateArchPalSection(data.paleontologia)
      );

    default:
      return true;
  }
};

const EditCavity: FC<RouterProps> = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const [successSuccessModal, setSuccessModal] = useState(false);
  const [errorLoading, setErrorLoading] = useState<string | null>(null); // Renomeado para evitar conflito com redux error
  const [isLoading, setIsLoading] = useState(true);
  const { currentStep, formData } = useSelector((state: RootState) => ({
    currentStep: state.cavity.currentStep,
    formData: state.cavity.cavidade,
  }));

  // Nova state para controle de tentativa de validação
  const [validationAttempted, setValidationAttempted] = useState(false);

  useEffect(() => {
    // console.log("Edit FormData:", JSON.stringify(formData, null, 2));
  }, [formData]);

  const scrollViewRef = useRef<ScrollView>(null);

  // Tipar o array de steps para que cada elemento seja um FC que aceita StepComponentProps
  const steps: FC<StepComponentProps>[] = [
    StepOne as FC<StepComponentProps>,
    StepTwo as FC<StepComponentProps>,
    StepThree as FC<StepComponentProps>,
    StepFour as FC<StepComponentProps>,
    StepFive as FC<StepComponentProps>,
    StepSix as FC<StepComponentProps>,
    StepSeven as FC<StepComponentProps>,
    StepEight as FC<StepComponentProps>,
    StepNine as FC<StepComponentProps>,
    StepTen as FC<StepComponentProps>,
  ];

  const StepComponent: FC<StepComponentProps> | undefined = steps[currentStep];

  const isCurrentStepValid = useMemo(
    () => validateStep(currentStep, formData),
    [currentStep, formData]
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("CavityScreen");
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

  const handleNext = async () => {
    setValidationAttempted(true); // Marcar que a validação foi tentada

    const isValidOnClick = validateStep(currentStep, formData); // Revalidar no clique

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

    setValidationAttempted(false); // Resetar se for válido

    if (currentStep === steps.length - 1) {
      if (!route?.params?.cavityId) {
        dispatch(
          showError({
            title: "Erro ao Editar",
            message: "ID da cavidade não encontrado.",
          })
        );
        return;
      }
      try {
        await updateCavity(route.params.cavityId, {
          // Manter a lógica de fallback para campos que podem ser undefined
          // e que o backend espera como string vazia ou objeto vazio
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
                  return new Date(y, m - 1, d, 12, 0, 0, 0).toISOString();
                } catch (e) {
                  return new Date().toISOString();
                }
              })()
            : new Date().toISOString(),
          municipio: formData.municipio || "",
          uf: formData.uf || "",
          localidade: formData.localidade,
          entradas: JSON.stringify(formData.entradas || []),
          desenvolvimento_linear: formData.desenvolvimento_linear,
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
        });
        setSuccessModal(true);
      } catch (err) {
        console.error("Error updating cavity:", err);
        dispatch(
          showError({
            title: "Erro ao editar cavidade",
            message:
              err instanceof Error
                ? err.message
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

  const fetchCavity = useCallback(async () => {
    if (!route?.params?.cavityId) {
      // Adicionado '?' para route e params
      setErrorLoading("ID da cavidade não fornecido.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setErrorLoading(null);
    try {
      const cavityCollection =
        database.collections.get<CavityRegister>("cavity_register");
      const foundCavity = await cavityCollection.find(route.params.cavityId);

      // Função para parsear JSON de forma segura, retornando um default em caso de erro ou valor nulo/undefined
      const safeJsonParse = (
        jsonString: string | null | undefined,
        defaultValue: any = {}
      ) => {
        if (jsonString === null || typeof jsonString === "undefined")
          return defaultValue;
        try {
          return JSON.parse(jsonString);
        } catch (e) {
          console.warn(
            "Failed to parse JSON, returning default:",
            jsonString,
            e
          );
          return defaultValue;
        }
      };

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
        desenvolvimento_linear: foundCavity.desenvolvimento_linear ?? undefined,
        entradas: safeJsonParse(foundCavity.entradas, []),
        dificuldades_externas: safeJsonParse(
          foundCavity.dificuldades_externas,
          { nenhuma: true, outroEnabled: false, outro: undefined }
        ),
        aspectos_socioambientais: safeJsonParse(
          foundCavity.aspectos_socioambientais,
          {
            uso_cavidade: { outroEnabled: false, outro: undefined },
            comunidade_envolvida: { envolvida: false },
            area_protegida: { nao_determinado: true },
            infraestrutura_acesso: { nenhuma: true },
          }
        ),
        caracterizacao_interna: safeJsonParse(
          foundCavity.caracterizacao_interna,
          {
            grupo_litologico: {},
            infraestrutura_interna: {
              nenhuma: true,
              outroEnabled: false,
              outros: undefined,
            },
            dificuldades_progressao_interna: {
              nenhuma: true,
              outro: undefined,
            },
          }
        ),
        topografia: safeJsonParse(foundCavity.topografia, undefined),
        morfologia: safeJsonParse(foundCavity.morfologia, undefined),
        hidrologia: safeJsonParse(foundCavity.hidrologia, undefined),
        sedimentos: safeJsonParse(foundCavity.sedimentos, {
          // Garantir que sedimentos tenha a estrutura esperada
          sedimentacao_clastica: {
            possui: false,
            tipo: {},
            outros: undefined,
            outroEnabled: false,
          },
          sedimentacao_organica: {
            possui: false,
            tipo: {},
            outros: undefined,
            outroEnabled: false,
          },
        }),
        espeleotemas: safeJsonParse(foundCavity.espeleotemas, {
          possui: false,
          lista: [],
        }),
        biota: safeJsonParse(foundCavity.biota, undefined), // Biota pode ter uma estrutura complexa, defina um default apropriado
        arqueologia: safeJsonParse(foundCavity.arqueologia, {
          possui: false,
          tipos: { outroEnabled: false, outro: undefined },
        }),
        paleontologia: safeJsonParse(foundCavity.paleontologia, {
          possui: false,
          tipos: { outroEnabled: false, outro: undefined },
        }),
      };
      dispatch(setFullInfos(formattedData));
    } catch (err) {
      console.error("Error fetching cavity details:", err);
      setErrorLoading("Erro ao carregar detalhes da cavidade.");
    } finally {
      setIsLoading(false);
    }
  }, [route?.params?.cavityId, dispatch]); // Adicionado dispatch

  useEffect(() => {
    if (route?.params?.cavityId) {
      // Fetch apenas se o ID existir
      fetchCavity();
    }
  }, [fetchCavity, route?.params?.cavityId]);

  useFocusEffect(
    // useFocusEffect para refetch quando a tela ganha foco
    useCallback(() => {
      if (route?.params?.cavityId) {
        fetchCavity();
      }
      return () => {
        // Opcional: limpar o estado ao sair da tela de edição se não for desejado que persista
        // dispatch(resetCavidadeState());
        // dispatch(updateCurrentStep(0));
      };
    }, [fetchCavity, route?.params?.cavityId])
  );

  const handleBack = () => {
    setValidationAttempted(false); // Resetar ao voltar
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
    dispatch(updateCurrentStep(0)); // Resetar para o primeiro passo para o próximo cadastro/edição
    dispatch(resetCavidadeState());
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

  if (!isLoading && errorLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <Header
          title="Erro"
          // navigation={navigation} // navigation já está disponível via props
          onCustomReturn={() => {
            dispatch(resetCavidadeState()); // Limpa o estado do formulário
            navigation.navigate("CavityScreen"); // Ou para uma tela de erro/lista
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

  if (!formData || !route?.params?.cavityId) {
    // Checagem adicional se formData não foi carregado
    return (
      <SafeAreaView style={styles.centered}>
        <Header title="Editar Caverna" onCustomReturn={handleBack} />
        <TextInter color={colors.white[100]} style={{ marginTop: 20 }}>
          Não foi possível carregar os dados da cavidade.
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
              // Passar as props necessárias, incluindo validationAttempted
              <StepComponent
                navigation={navigation}
                route={route} // Passar route se os steps precisarem dele
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
  // buttonDisabled: { // Removido, pois NextButton deve ter seu próprio estilo de desabilitado
  //   backgroundColor: colors.dark[50],
  //   opacity: 0.7,
  // },
  centered: {
    flex: 1,
    justifyContent: "center", // Centralizado para loading/error
    alignItems: "center",
    backgroundColor: colors.dark[90],
    paddingHorizontal: 20,
  },
});
