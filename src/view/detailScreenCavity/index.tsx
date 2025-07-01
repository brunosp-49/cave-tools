import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Divider } from "../../components/divider";
import { Header } from "../../components/header";
import TextInter from "../../components/textInter";
import { colors } from "../../assets/colors";
import {
  Arqueologia,
  AspectosSocioambientais,
  Biota,
  CaracterizacaoInterna,
  Dificuldades_externas,
  Entrada,
  Espeleotemas,
  Grupo_litologico,
  Hidrologia,
  MorfologiaData,
  Paleontologia,
  RouterProps,
  Sedimentos,
  Invertebrado,
  InvertebradoAquatico,
  Posicao_vertente, // Added from formatPosicaoVertente usage
  Insercao, // Added from formatInsercao usage
  Vegetacao, // Added from formatVegetacao usage
  Uso_cavidade, // Added from formatUsoCavidade usage
  Infraestrutura_acesso, // Added from formatInfraestruturaAcesso usage
  Infraestrutura_interna, // Added from formatInfraestruturaInterna usage
  Dificuldades_progressao_interna, // Added from formatDificuldadesInternas usage
  HidrologiaFeature,
  Cavidade, // Added from formatHidrologia usage
} from "../../types";
import { FC, useCallback, useEffect, useState } from "react";
import { LabelText } from "../../components/labelText";
import CavityRegister from "../../db/model/cavityRegister";
import { database } from "../../db";
import { formatDate } from "../../util";
import { LongButton } from "../../components/longButton";
import Project from "../../db/model/project";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { Q } from "@nozbe/watermelondb";

// Helper function
const isFieldFilled = (value: any): boolean => {
  if (value === null || typeof value === "undefined") return false;
  if (typeof value === "string" && value.trim() === "") return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
};

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
  Caramujo: "caramujo_terrestre", // Assuming "Caramujo" meant terrestrial in old data
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
  Caramujo: "caramujo_aquatico", // Ensure this mapping is correct for your old data
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

export const DetailScreenCavity: FC<RouterProps> = ({ navigation, route }) => {
  const [cavity, setCavity] = useState<CavityRegister | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);

  // Parsed data states
  const [entradasData, setEntradasData] = useState<Entrada[]>([]);
  const [dificuldadesExternasData, setDificuldadesExternasData] =
    useState<Dificuldades_externas | null>(null);
  const [aspectosSocioambientaisData, setAspectosSocioambientaisData] =
    useState<AspectosSocioambientais | null>(null);
  const [caracterizacaoInternaData, setCaracterizacaoInternaData] =
    useState<CaracterizacaoInterna | null>(null);
  const [morfologiaData, setMorfologiaData] = useState<MorfologiaData | null>(
    null
  );
  const [hidrologiaData, setHidrologiaData] = useState<Hidrologia | null>(null);
  const [sedimentosData, setSedimentosData] = useState<Sedimentos | null>(null);
  const [espeleotemasData, setEspeleotemasData] = useState<Espeleotemas | null>(
    null
  );
  const [biotaData, setBiotaData] = useState<Biota | null>(null);
  const [arqueologiaData, setArqueologiaData] = useState<Arqueologia | null>(
    null
  );
  const [paleontologiaData, setPaleontologiaData] =
    useState<Paleontologia | null>(null);
  const [topografiaData, setTopografiaData] =
    useState<Cavidade["topografia"]>();
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchCavityAndParse = async () => {
      const cavityId = route.params?.cavityId;
      if (!cavityId) {
        setError("ID da cavidade não fornecido.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const cavityCollection =
          database.collections.get<CavityRegister>("cavity_register");
        const cavities = await cavityCollection
          .query(Q.where("cavidade_id", cavityId))
          .fetch();
        const foundCavity = cavities[0];
        setCavity(foundCavity);
        if (foundCavity.projeto_id) {
          const projectCollection =
            database.collections.get<Project>("project");
          // Ensure project is found before setting, handle potential error
          try {
            const projects = await projectCollection
              .query(Q.where("projeto_id", foundCavity.projeto_id))
              .fetch();
            const foundProject = projects[0];
            setProject(foundProject);
          } catch (projectError) {
            console.warn(
              `Project with ID ${foundCavity.projeto_id} not found for cavity ${cavityId}`,
              projectError
            );
            setProject(null);
          }
        } else {
          setProject(null);
        }

        const parse = (
          jsonString: string | null | undefined,
          defaultVal: any = {}
        ) => {
          if (jsonString === null || typeof jsonString === "undefined")
            return JSON.parse(JSON.stringify(defaultVal));
          try {
            return JSON.parse(jsonString);
          } catch (e) {
            return JSON.parse(JSON.stringify(defaultVal));
          }
        };

        // Define default structures for parsing, reflecting minimal valid state
        const defaultDificuldadesExternas: Dificuldades_externas = {
          nenhuma: true,
        };
        const defaultAspectosSocioambientais: AspectosSocioambientais = {
          uso_cavidade: {},
          comunidade_envolvida: { envolvida: false },
          area_protegida: { nao_determinado: true },
          infraestrutura_acesso: { nenhuma: true },
        };
        const defaultCaracterizacaoInterna: CaracterizacaoInterna = {
          grupo_litologico: {},
          infraestrutura_interna: { nenhuma: true },
          dificuldades_progressao_interna: { nenhuma: true },
          depredacao_localizada: false,
          depredacao_intensa: false,
        };
        const defaultBiota: Biota = {
          invertebrado: { possui: false },
          invertebrado_aquatico: { possui: false },
          anfibios: { possui: false },
          repteis: { possui: false },
          aves: { possui: false },
          peixes: false,
          morcegos: { possui: false },
        };
        const defaultSedimentos: Sedimentos = {
          sedimentacao_clastica: { possui: false },
          sedimentacao_organica: { possui: false },
        };
        const defaultEspeleotemas: Espeleotemas = { possui: false, tipos: [] };
        const defaultArqueologia: Arqueologia = { possui: false, tipos: {} };
        const defaultPaleontologia: Paleontologia = {
          possui: false,
          tipos: {},
        };

        setEntradasData(parse(foundCavity.entradas, []));
        setDificuldadesExternasData(
          parse(foundCavity.dificuldades_externas, defaultDificuldadesExternas)
        );
        setAspectosSocioambientaisData(
          parse(
            foundCavity.aspectos_socioambientais,
            defaultAspectosSocioambientais
          )
        );

        const ciDb = parse(
          foundCavity.caracterizacao_interna,
          defaultCaracterizacaoInterna
        );
        const transformedCI: CaracterizacaoInterna = {
          ...ciDb,
        };
        setCaracterizacaoInternaData(transformedCI);

        setMorfologiaData(
          parse(foundCavity.morfologia, {
            padrao_planimetrico: {},
            forma_secoes: {},
          })
        );
        setHidrologiaData(parse(foundCavity.hidrologia, {}));
        setSedimentosData(parse(foundCavity.sedimentos, defaultSedimentos));
        setEspeleotemasData(
          parse(foundCavity.espeleotemas, defaultEspeleotemas)
        );

        const biotaDbParsed = parse(foundCavity.biota, defaultBiota);
        const transformedBiota: Biota = JSON.parse(
          JSON.stringify(defaultBiota)
        ); // Start with a full default
        // Merge known properties from biotaDbParsed into transformedBiota
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
          invertebradoKeysArray.forEach((key) => {
            const oldTypeString =
              Object.keys(invertebradoDisplayToKeyMap).find(
                (k) => invertebradoDisplayToKeyMap[k] === key
              ) || key;
            (inv as any)[key] =
              biotaDbParsed.invertebrados.tipos.includes(oldTypeString);
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
          invertebradoAquaticoKeysArray.forEach((key) => {
            const oldTypeString =
              Object.keys(invertebradoAquaticoDisplayToKeyMap).find(
                (k) => invertebradoAquaticoDisplayToKeyMap[k] === key
              ) || key;
            (invAq as any)[key] =
              biotaDbParsed.invertebrados_aquaticos.tipos.includes(
                oldTypeString
              );
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
        setBiotaData(transformedBiota);

        setArqueologiaData(parse(foundCavity.arqueologia, defaultArqueologia));
        setPaleontologiaData(
          parse(foundCavity.paleontologia, defaultPaleontologia)
        );
        setTopografiaData(
          parse(foundCavity.topografia, { espeleometria: {}, previsao: {} })
        );
      } catch (err) {
        console.error("Error fetching and parsing cavity details:", err);
        setError("Erro ao carregar ou processar detalhes da cavidade.");
        setCavity(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCavityAndParse();
  }, [route.params?.cavityId, navigation, isFocused]);

  useFocusEffect(
    /* ... (same as before) ... */
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("CavityScreen");
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => subscription.remove();
    }, [navigation])
  );

  const formatFlags = (
    /* ... (same as before, ensure isFieldFilled is used if needed) ... */
    obj: Record<string, any> | undefined | null,
    labels: Record<string, string>,
    includeOutro = true,
    isExclusiveNenhuma = false
  ): string => {
    if (!obj) return "Não informado";
    if (isExclusiveNenhuma && obj.nenhuma === true)
      return labels.nenhuma || "Nenhuma";

    const items: string[] = [];
    for (const key in labels) {
      if (isExclusiveNenhuma && key === "nenhuma") continue;
      if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] === true) {
        items.push(labels[key]);
      }
    }
    if (includeOutro && obj.outroEnabled && isFieldFilled(obj.outro)) {
      // Used isFieldFilled
      items.push(`Outro: ${obj.outro}`);
    }
    return items.length > 0
      ? items.join(", ")
      : isExclusiveNenhuma
      ? "Não informado"
      : "Nenhuma selecionada";
  };

  // ... (all other formatXyz functions: formatPosicaoVertente, formatInsercao, etc. remain as previously defined)
  const formatPosicaoVertente = (posicao?: Posicao_vertente): string =>
    formatFlags(
      posicao,
      { topo: "Topo", alta: "Alta", media: "Média", baixa: "Baixa" },
      false,
      false
    );
  const formatInsercao = (insercao?: Insercao): string =>
    formatFlags(insercao, {
      afloramento_rochoso_continuo: "Afloramento rochoso contínuo",
      afloramento_isolado: "Afloramento isolado",
      escarpa_rochosa_continua: "Escarpa rochosa contínua",
      escarpa_rochosa_descontinua: "Escarpa rochosa descontínua",
      dolina: "Dolina",
      deposito_talus: "Depósito tálus",
    });
  const formatVegetacao = (vegetacao?: Vegetacao): string =>
    formatFlags(vegetacao, {
      cerrado: "Cerrado",
      campo_rupestre: "Campo rupestre",
      floresta_estacional_semidecidual: "Floresta estacional semidecidual",
      floresta_ombrofila: "Floresta ombrófila",
      mata_seca: "Mata seca",
      campo_sujo: "Campo sujo",
    });
  const formatArqueologia = (arq?: Arqueologia | null): string => {
    if (!arq?.possui) return "Não possui";
    return formatFlags(arq.tipos, {
      material_litico: "Material lítico",
      material_ceramico: "Material cerâmico",
      pintura_rupestre: "Pintura rupestre",
      gravura: "Gravura",
      ossada_humana: "Ossada humana",
      enterramento: "Enterramento",
      nao_identificado: "Não identificado",
    });
  };
  const formatPaleontologia = (pal?: Paleontologia | null): string => {
    if (!pal?.possui) return "Não possui";
    return formatFlags(pal.tipos, {
      ossada: "Ossada",
      iconofossil: "Iconofóssil",
      jazigo: "Jazigo",
      nao_identificado: "Não identificado",
    });
  };
  const formatDificuldadesExternas = (
    dif?: Dificuldades_externas | null
  ): string =>
    formatFlags(
      dif,
      {
        rastejamento: "Rastejamento",
        quebra_corpo: "Quebra corpo",
        teto_baixo: "Teto baixo",
        natacao: "Natação",
        sifao: "Sifão",
        blocos_instaveis: "Blocos instáveis",
        lances_verticais: "Lances verticais",
        cachoeira: "Cachoeira",
        trechos_escorregadios: "Trechos escorregadios",
        passagem_curso_agua: "Passagem curso d'água",
        nenhuma: "Nenhuma",
      },
      true,
      true
    );
  const formatUsoCavidade = (uso?: Uso_cavidade | null): string =>
    formatFlags(uso, {
      religioso: "Religioso",
      cientifico_cultural: "Científico/Cultural",
      social: "Social",
      minerario: "Minerário",
      pedagogico: "Pedagógico",
      esportivo: "Esportivo",
      turistico: "Turístico",
      incipiente: "Incipiente",
      massa: "Massa",
      aventura: "Aventura",
      mergulho: "Mergulho",
      rapel: "Rapel",
    });
  const formatInfraestruturaAcesso = (
    infra?: Infraestrutura_acesso | null
  ): string =>
    formatFlags(
      infra,
      {
        receptivo: "Receptivo",
        condutor_para_visitantes: "Condutor para visitantes",
        lanchonete_ou_restaurante: "Lanchonete/Restaurante",
        pousada_ou_hotel: "Pousada/Hotel",
        nenhuma: "Nenhuma",
      },
      true,
      true
    );
  const formatGrupoLitologico = (grupo?: Grupo_litologico | null): string =>
    formatFlags(grupo, {
      rochas_carbonaticas: "Rochas carbonáticas",
      rochas_ferriferas_ferruginosas: "Rochas ferríferas/ferruginosas",
      rochas_siliciclasticas: "Rochas siliciclásticas",
      rochas_peliticas: "Rochas pelíticas",
      rochas_granito_gnaissicas: "Rochas granito/gnáissicas",
    });
  const formatInfraestruturaInterna = (
    infra?: Infraestrutura_interna | null
  ): string => {
    if (!infra) return "Não informado";
    if (infra.nenhuma) return "Nenhuma";
    const items = [];
    if (infra.passarela) items.push("Passarela");
    if (infra.corrimao) {
      const corrimaoTipos = formatFlags(
        infra.corrimao,
        { ferro: "Ferro", madeira: "Madeira", corda: "Corda" },
        true,
        false
      );
      if (
        corrimaoTipos !== "Nenhuma selecionada" &&
        corrimaoTipos !== "Não informado"
      )
        items.push(`Corrimão (${corrimaoTipos})`);
    }
    if (infra.portao) items.push("Portão");
    if (infra.escada) items.push("Escada");
    if (infra.corda) items.push("Corda (instalada)");
    if (infra.iluminacao_artificial) items.push("Iluminação artificial");
    if (infra.ponto_ancoragem) items.push("Ponto de ancoragem");
    if (infra.outroEnabled && isFieldFilled(infra.outros))
      items.push(`Outro: ${infra.outros}`);
    return items.length > 0 ? items.join(", ") : "Nenhuma selecionada";
  };
  const formatDificuldadesInternas = (
    dif?: Dificuldades_progressao_interna | null
  ): string =>
    formatFlags(
      dif,
      {
        teto_baixo: "Teto baixo",
        blocos_instaveis: "Blocos instáveis",
        trechos_escorregadios: "Trechos escorregadios",
        rastejamento: "Rastejamento",
        natacao: "Natação",
        lances_verticais: "Lances verticais",
        passagem_curso_agua: "Passagem curso d'água",
        quebra_corpo: "Quebra corpo",
        sifao: "Sifão",
        cachoeira: "Cachoeira",
        nenhuma: "Nenhuma",
      },
      true,
      true
    );
  const formatMorfologia = (morf?: MorfologiaData | null): string[] => {
    if (!morf) return ["Não informado"];
    const padrao = formatFlags(morf.padrao_planimetrico, {
      retilinea: "Retilínea",
      anastomosada: "Anástomosada",
      espongiforme: "Espongiforme",
      labirintica: "Labiríntica",
      reticulado: "Reticulado",
      ramiforme: "Ramiforme",
      dendritico: "Dendrítico",
    });
    const forma = formatFlags(morf.forma_secoes, {
      circular: "Circular",
      eliptica_horizontal: "Elíptica horizontal",
      eliptica_vertical: "Elíptica vertical",
      eliptica_inclinada: "Elíptica inclinada",
      lenticular_vertical: "Lenticular vertical",
      lenticular_horizontal: "Lenticular horizontal",
      poligonal: "Poligonal",
      poligonal_tabular: "Poligonal tabular",
      triangular: "Triangular",
      fechadura: "Fechadura",
      linear_inclinada: "Linear inclinada",
      linear_vertical: "Linear vertical",
      irregular: "Irregular",
      mista: "Mista",
    });
    return [
      `Padrão Planimétrico: ${padrao || "N/I"}`,
      `Forma das Seções: ${forma || "N/I"}`,
    ];
  };
  const formatHidrologia = (hidro?: Hidrologia | null): string[] => {
    if (!hidro) return ["Não informado"];
    const features: string[] = [];
    const formatFeature = (feature?: HidrologiaFeature, label?: string) =>
      feature?.possui && label
        ? `${label}: Sim (${feature.tipo || "Tipo N/A"})`
        : null;
    const addFeature = (label: string, feature?: HidrologiaFeature) => {
      const res = formatFeature(feature, label);
      features.push(res || `${label}: Não`);
    };
    addFeature("Curso d'água", hidro.curso_agua);
    addFeature("Lago", hidro.lago);
    addFeature("Sumidouro", hidro.sumidouro);
    addFeature("Surgência", hidro.surgencia);
    addFeature("Gotejamento", hidro.gotejamento);
    addFeature("Empossamento", hidro.empossamento);
    addFeature("Condensação", hidro.condensacao);
    addFeature("Exudação", hidro.exudacao);
    if (isFieldFilled(hidro.outro)) features.push(`Outro: ${hidro.outro}`);
    return features.length > 0
      ? features
      : ["Nenhuma característica hidrológica informada."];
  };
  const formatSedimentos = (sed?: Sedimentos | null): string[] => {
    if (!sed) return ["Não informado"];
    const result: string[] = [];
    const clastica = sed.sedimentacao_clastica;
    if (clastica?.possui) {
      result.push("Sedimentação Clástica: Sim");
      const tiposClasticos: string[] = [];
      const tipo = clastica.tipo;
      if (tipo) {
        if (tipo.rochoso) tiposClasticos.push("Rochoso");
        const formatDetalhe = (detalhe?: any, label?: string) =>
          detalhe && label
            ? `${label} (Dist: ${detalhe.distribuicao || "N/A"}, Orig: ${
                detalhe.origem || "N/A"
              })`
            : null;
        tiposClasticos.push(formatDetalhe(tipo.argila, "Argila") || "");
        tiposClasticos.push(formatDetalhe(tipo.silte, "Silte") || "");
        tiposClasticos.push(formatDetalhe(tipo.areia, "Areia") || "");
        tiposClasticos.push(
          formatDetalhe(tipo.fracao_granulo, "Grânulo") || ""
        );
        tiposClasticos.push(
          formatDetalhe(tipo.seixo_predominante, "Seixo") || ""
        );
        tiposClasticos.push(formatDetalhe(tipo.fracao_calhau, "Calhau") || "");
        tiposClasticos.push(
          formatDetalhe(tipo.matacao_predominante, "Matacão") || ""
        );
      }
      if (clastica.outroEnabled && isFieldFilled(clastica.outros))
        tiposClasticos.push(`Outros: ${clastica.outros}`);
      result.push(
        `  Tipos Clásticos: ${
          tiposClasticos.filter((t) => t).join(", ") || "Nenhum"
        }`
      );
    } else result.push("Sedimentação Clástica: Não");
    const organica = sed.sedimentacao_organica;
    if (organica?.possui) {
      result.push("Sedimentação Orgânica: Sim");
      const tiposOrganicos: string[] = [];
      const tipoOrg = organica.tipo;
      if (tipoOrg) {
        if (tipoOrg.guano) {
          const guanoTipos: string[] = [];
          const formatGuano = (gTipo?: any, label?: string) =>
            gTipo?.possui && label ? `${label} (${gTipo.tipo || "N/A"})` : null;
          guanoTipos.push(
            formatGuano(tipoOrg.guano.carnivoro, "Carnívoro") || ""
          );
          guanoTipos.push(
            formatGuano(tipoOrg.guano.frugivoro, "Frugívoro") || ""
          );
          guanoTipos.push(
            formatGuano(tipoOrg.guano.hematofago, "Hematófago") || ""
          );
          guanoTipos.push(
            formatGuano(
              (tipoOrg.guano as any).inderterminado,
              "Indeterminado"
            ) || ""
          );
          if (guanoTipos.filter((t) => t).length > 0)
            tiposOrganicos.push(
              `Guano: ${guanoTipos.filter((t) => t).join(", ")}`
            );
        }
        if (tipoOrg.folhico) tiposOrganicos.push("Folhiço");
        if (tipoOrg.galhos) tiposOrganicos.push("Galhos");
        if (tipoOrg.raizes) tiposOrganicos.push("Raízes");
        if (tipoOrg.vestigios_ninhos)
          tiposOrganicos.push("Vestígios de ninhos");
        if (tipoOrg.pelotas_regurgitacao)
          tiposOrganicos.push("Pelotas de regurgitação");
      }
      if (organica.outroEnabled && isFieldFilled(organica.outros))
        tiposOrganicos.push(`Outros: ${organica.outros}`);
      result.push(
        `  Tipos Orgânicos: ${tiposOrganicos.join(", ") || "Nenhum"}`
      );
    } else result.push("Sedimentação Orgânica: Não");
    return result.length > 0 ? result : ["Nenhuma informação de sedimento."];
  };

  // --- Rendering Logic ---
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
  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Header
          title="Erro"
          navigation={navigation}
          onCustomReturn={() => navigation.goBack()}
        />
        <Divider />
        <TextInter color={colors.error[100]} style={{ marginTop: 20 }}>
          {error}
        </TextInter>
      </SafeAreaView>
    );
  }
  if (!cavity) {
    return (
      <SafeAreaView style={styles.centered}>
        <Header
          title="Não Encontrado"
          navigation={navigation}
          onCustomReturn={() => navigation.goBack()}
        />
        <Divider />
        <TextInter style={{ marginTop: 20 }}>
          Cavidade não encontrada.
        </TextInter>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.main}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header
          title="Visualizar Caracterização"
          navigation={navigation}
          onCustomReturn={() => navigation.navigate("CavityScreen")}
        />
        <Divider />
        <View style={styles.container}>
          <TextInter color={colors.white[100]} fontSize={19}>
            Registro
          </TextInter>
          <Divider />
          <LabelText
            label="Projeto"
            text={
              project?.nome_projeto ||
              (cavity.projeto_id
                ? `ID do Projeto: ${cavity.projeto_id}`
                : "Não associado a projeto")
            }
          />
          <Divider />
          <LabelText label="Responsável" text={cavity.responsavel || "N/I"} />
          <Divider />
          <LabelText
            label="Nome da cavidade"
            text={cavity.nome_cavidade || "N/I"}
          />
          <Divider />
          <LabelText
            label="Nome do sistema"
            text={cavity.nome_sistema || "N/I"}
          />
          <Divider />
          <LabelText label="Localidade" text={cavity.localidade || "N/I"} />
          <Divider />
          <LabelText label="Município" text={cavity.municipio || "N/I"} />
          <Divider />
          <LabelText label="UF" text={cavity.uf || "N/I"} />
          <Divider />
          <LabelText label="Data" text={formatDate(cavity.data) || "N/I"} />
          <Divider />
          <LabelText
            label="Desenvolvimento Linear (m)"
            text={cavity.desenvolvimento_linear?.toString() ?? "N/I"}
          />
          <Divider />
          <TextInter
            weight="medium"
            color={colors.dark[60]}
            style={styles.subHeader}
          >
            Entradas ({entradasData.length})
          </TextInter>
          {entradasData.length > 0 ? (
            entradasData.map((entrada, index) => (
              <View key={index} style={styles.entradaContainer}>
                <View style={styles.entradaHeader}>
                  <TextInter weight="semi-bold" color={colors.white[90]}>
                    {entrada.nome || `Entrada ${index + 1}`}
                  </TextInter>
                  {entrada.principal && (
                    <TextInter
                      fontSize={12}
                      color={colors.accent[100]}
                      weight="bold"
                    >
                      {" "}
                      (Principal)
                    </TextInter>
                  )}
                </View>
                <LabelText
                  label="Datum"
                  text={entrada.coordenadas?.datum || "N/A"}
                />
                <LabelText
                  label="Longitude"
                  text={entrada.coordenadas?.graus_e || "N/A"}
                />
                <LabelText
                  label="Latitude"
                  text={entrada.coordenadas?.graus_n || "N/A"}
                />
                <LabelText
                  label="UTM E"
                  text={entrada.coordenadas?.utm?.utm_e?.toString() ?? "N/A"}
                />
                <LabelText
                  label="UTM N"
                  text={entrada.coordenadas?.utm?.utm_n?.toString() ?? "N/A"}
                />
                <LabelText
                  label="Zona UTM"
                  text={entrada.coordenadas?.utm?.zona || "N/A"}
                />
                <LabelText
                  label="Elevação (m)"
                  text={entrada.coordenadas?.utm?.elevacao?.toString() ?? "N/A"}
                />
                <LabelText
                  label="Satélites"
                  text={entrada.coordenadas?.satelites?.toString() || "N/A"}
                />
                <LabelText
                  label="Inserção"
                  text={formatInsercao(entrada.caracteristicas?.insercao)}
                />
                <LabelText
                  label="Posição Vertente"
                  text={formatPosicaoVertente(
                    entrada.caracteristicas?.posicao_vertente
                  )}
                />
                <LabelText
                  label="Vegetação"
                  text={formatVegetacao(entrada.caracteristicas?.vegetacao)}
                />
                {entrada.foto ? (
                  <>
                    <LabelText label="Foto" text="" />
                    <Image
                      style={styles.entradaImage}
                      source={{ uri: entrada.foto }}
                      resizeMode="cover"
                    />
                  </>
                ) : (
                  <LabelText label="Foto" text="Nenhuma" />
                )}
                {index < entradasData.length - 1 && <Divider height={15} />}
              </View>
            ))
          ) : (
            <TextInter fontSize={12} color={colors.dark[60]}>
              Nenhuma entrada.
            </TextInter>
          )}
          <Divider height={18} />

          <View style={styles.sectionContainer}>
            <TextInter color={colors.white[100]} fontSize={19}>
              Caracterização Interna
            </TextInter>
            <Divider />
            <TextInter
              weight="medium"
              color={colors.dark[60]}
              style={styles.subHeader}
            >
              Morfologia
            </TextInter>
            {formatMorfologia(morfologiaData).map((line, index) => (
              <TextInter key={`morf-${index}`} style={styles.detailText}>
                {line}
              </TextInter>
            ))}
            <Divider />
            <TextInter
              weight="medium"
              color={colors.dark[60]}
              style={styles.subHeader}
            >
              Hidrologia
            </TextInter>
            {formatHidrologia(hidrologiaData).map((line, index) => (
              <TextInter key={`hidro-${index}`} style={styles.detailText}>
                {line}
              </TextInter>
            ))}
            <Divider />
            <LabelText
              label="Grupo Litológico"
              text={formatGrupoLitologico(
                caracterizacaoInternaData?.grupo_litologico
              )}
            />
            <Divider />
            <LabelText
              label="Desenvolvimento Predominante"
              text={
                caracterizacaoInternaData?.desenvolvimento_predominante || "N/I"
              }
            />
            <Divider />
            <TextInter
              weight="medium"
              color={colors.white[80]}
              style={styles.subHeader}
            >
              Estado de Conservação
            </TextInter>
            {caracterizacaoInternaData?.depredacao_localizada ||
            caracterizacaoInternaData?.depredacao_intensa ? (
              <>
                {caracterizacaoInternaData?.depredacao_localizada && (
                  <LabelText
                    label="Depredação Localizada"
                    text={
                      caracterizacaoInternaData.descricao_depredacao_localizada ||
                      "Detalhes N/I"
                    }
                  />
                )}
                {caracterizacaoInternaData?.depredacao_intensa && (
                  <LabelText
                    label="Depredação Intensa"
                    text={
                      caracterizacaoInternaData.descricao_depredacao_intensa ||
                      "Detalhes N/I"
                    }
                  />
                )}
              </>
            ) : (
              <TextInter style={styles.detailText}>Conservada</TextInter>
            )}
            <Divider />
            <LabelText
              label="Infraestrutura Interna"
              text={formatInfraestruturaInterna(
                caracterizacaoInternaData?.infraestrutura_interna
              )}
            />
            <Divider />
            <LabelText
              label="Dificuldades de Progressão Interna"
              text={formatDificuldadesInternas(
                caracterizacaoInternaData?.dificuldades_progressao_interna
              )}
            />
            <Divider />
            <TextInter
              weight="medium"
              color={colors.dark[60]}
              style={styles.subHeader}
            >
              Espeleotemas
            </TextInter>
            {espeleotemasData?.possui ? (
              espeleotemasData.tipos && espeleotemasData.tipos.length > 0 ? (
                espeleotemasData.tipos.map((item, index) => (
                  <LabelText
                    key={item.id || index}
                    label={`- ${item.tipo || "N/I"}`}
                    text={`Porte: ${item.porte || "N/A"}, Freq: ${
                      item.frequencia || "N/A"
                    }, Conserv: ${item.estado_conservacao || "N/A"}`}
                  />
                ))
              ) : (
                <TextInter fontSize={12} color={colors.dark[60]}>
                  Lista de espeleotemas não disponível.
                </TextInter>
              )
            ) : (
              <TextInter fontSize={12} color={colors.dark[60]}>
                Não possui.
              </TextInter>
            )}
            <Divider />
            <TextInter
              weight="medium"
              color={colors.dark[60]}
              style={styles.subHeader}
            >
              Sedimentos
            </TextInter>
            {formatSedimentos(sedimentosData).map((line, index) => (
              <TextInter key={`sed-${index}`} style={styles.detailText}>
                {line}
              </TextInter>
            ))}
          </View>
          <Divider height={18} />

          <View style={styles.sectionContainer}>
            <TextInter color={colors.white[100]} fontSize={19}>
              Biota
            </TextInter>
            <Divider />
            <LabelText
              label="Invertebrados"
              text={
                biotaData?.invertebrado?.possui
                  ? formatFlags(
                      biotaData.invertebrado,
                      invertebradoLabels,
                      true,
                      false
                    )
                  : "Não possui"
              }
            />
            <Divider />
            <LabelText
              label="Invertebrados Aquáticos"
              text={
                biotaData?.invertebrado_aquatico?.possui
                  ? formatFlags(
                      biotaData.invertebrado_aquatico,
                      invertebradoAquaticoLabels,
                      true,
                      false
                    )
                  : "Não possui"
              }
            />
            <Divider />
            <LabelText
              label="Anfíbios"
              text={
                biotaData?.anfibios?.possui
                  ? biotaData.anfibios.tipos &&
                    biotaData.anfibios.tipos.length > 0
                    ? biotaData.anfibios.tipos.join(", ")
                    : isFieldFilled(biotaData.anfibios.outro)
                    ? `Outro: ${biotaData.anfibios.outro}`
                    : "Tipos N/I"
                  : "Não possui"
              }
            />
            <Divider />
            <LabelText
              label="Répteis"
              text={
                biotaData?.repteis?.possui
                  ? biotaData.repteis.tipos &&
                    biotaData.repteis.tipos.length > 0
                    ? biotaData.repteis.tipos.join(", ")
                    : isFieldFilled(biotaData.repteis.outro)
                    ? `Outro: ${biotaData.repteis.outro}`
                    : "Tipos N/I"
                  : "Não possui"
              }
            />
            <Divider />
            <LabelText
              label="Aves"
              text={
                biotaData?.aves?.possui
                  ? biotaData.aves.tipos && biotaData.aves.tipos.length > 0
                    ? biotaData.aves.tipos.join(", ")
                    : isFieldFilled(biotaData.aves.outro)
                    ? `Outro: ${biotaData.aves.outro}`
                    : "Tipos N/I"
                  : "Não possui"
              }
            />
            <Divider />
            <LabelText
              label="Peixes"
              text={biotaData?.peixes ? "Sim" : "Não"}
            />
            <Divider />
            <TextInter
              weight="medium"
              color={colors.dark[60]}
              style={styles.subHeader}
            >
              Morcegos
            </TextInter>
            {biotaData?.morcegos?.possui ? (
              biotaData.morcegos.tipos &&
              biotaData.morcegos.tipos.length > 0 ? (
                biotaData.morcegos.tipos.map((morcego, index) => (
                  <LabelText
                    key={index}
                    label={`- ${morcego.tipo || "N/I"}`}
                    text={`Quantidade: ${morcego.quantidade || "N/A"}`}
                  />
                ))
              ) : (
                <TextInter fontSize={12} color={colors.dark[60]}>
                  Tipos não especificados.
                </TextInter>
              )
            ) : (
              <TextInter fontSize={12} color={colors.dark[60]}>
                Não possui.
              </TextInter>
            )}
            {biotaData?.morcegos?.observacoes_gerais && (
              <LabelText
                label="Obs. Morcegos"
                text={biotaData.morcegos.observacoes_gerais}
              />
            )}
          </View>
          <Divider height={18} />

          <View style={styles.sectionContainer}>
            <TextInter color={colors.white[100]} fontSize={19}>
              Arqueologia
            </TextInter>
            <Divider />
            <LabelText
              label="Vestígios"
              text={formatArqueologia(arqueologiaData)}
            />
          </View>
          <Divider height={18} />
          <View style={styles.sectionContainer}>
            <TextInter color={colors.white[100]} fontSize={19}>
              Paleontologia
            </TextInter>
            <Divider />
            <LabelText
              label="Vestígios"
              text={formatPaleontologia(paleontologiaData)}
            />
          </View>
          <Divider height={18} />
          <View style={styles.sectionContainer}>
            <TextInter color={colors.white[100]} fontSize={19}>
              Aspectos Externos
            </TextInter>
            <Divider />
            <LabelText
              label="Dificuldades Externas"
              text={formatDificuldadesExternas(dificuldadesExternasData)}
            />
            <Divider />
            <TextInter
              weight="medium"
              color={colors.dark[60]}
              style={styles.subHeader}
            >
              Aspectos Socioambientais
            </TextInter>
            <LabelText
              label="Uso da Cavidade"
              text={formatUsoCavidade(
                aspectosSocioambientaisData?.uso_cavidade
              )}
            />
            <Divider height={5} />
            <LabelText
              label="Comunidade Envolvida"
              text={
                aspectosSocioambientaisData?.comunidade_envolvida?.envolvida
                  ? "Sim"
                  : "Não"
              }
            />
            {aspectosSocioambientaisData?.comunidade_envolvida?.envolvida &&
              aspectosSocioambientaisData?.comunidade_envolvida?.descricao && (
                <LabelText
                  label="Descrição (Comunidade)"
                  text={
                    aspectosSocioambientaisData.comunidade_envolvida.descricao
                  }
                />
              )}
            <Divider height={5} />
            <LabelText
              label="Área Protegida"
              text={
                aspectosSocioambientaisData?.area_protegida?.federal?.nome
                  ? `Federal: ${
                      aspectosSocioambientaisData.area_protegida.federal.nome
                    } (${
                      aspectosSocioambientaisData.area_protegida.federal.zona ||
                      "N/A"
                    })`
                  : aspectosSocioambientaisData?.area_protegida?.estadual?.nome
                  ? `Estadual: ${
                      aspectosSocioambientaisData.area_protegida.estadual.nome
                    } (${
                      aspectosSocioambientaisData.area_protegida.estadual
                        .zona || "N/A"
                    })`
                  : aspectosSocioambientaisData?.area_protegida?.municipal?.nome
                  ? `Municipal: ${
                      aspectosSocioambientaisData.area_protegida.municipal.nome
                    } (${
                      aspectosSocioambientaisData.area_protegida.municipal
                        .zona || "N/A"
                    })`
                  : aspectosSocioambientaisData?.area_protegida?.nao_determinado
                  ? "Não determinado"
                  : "Não informado"
              }
            />
            <Divider height={5} />
            <LabelText
              label="Infraestrutura de Acesso"
              text={formatInfraestruturaAcesso(
                aspectosSocioambientaisData?.infraestrutura_acesso
              )}
            />
          </View>
          <Divider height={18} />
          {cavity && !cavity.uploaded && (
            <LongButton
              title="Editar"
              onPress={() =>
                navigation.navigate("EditCavity", {
                  cavityId: route.params.cavityId,
                })
              }
            />
          )}
          <Divider height={20} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Default minimal structures for biota if not fully present in DB record.
// These match the structure of the Biota type and its sub-types.
const defaultBiota: Biota = {
  invertebrado: { possui: false, outroEnabled: false },
  invertebrado_aquatico: { possui: false, outroEnabled: false },
  anfibios: { possui: false, tipos: [], outroEnabled: false },
  repteis: { possui: false, tipos: [], outroEnabled: false },
  aves: { possui: false, tipos: [], outroEnabled: false },
  peixes: false,
  morcegos: { possui: false, tipos: [] },
};

const styles = StyleSheet.create({
  main: { backgroundColor: colors.dark[90], flex: 1, paddingHorizontal: 20 },
  container: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#30434f",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 25,
    marginBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: colors.dark[90],
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  subHeader: {
    marginBottom: 8,
    marginTop: 5,
    fontSize: 14,
    color: colors.dark[40],
  },
  entradaContainer: {
    marginTop: 8,
    marginBottom: 8,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent[100],
    paddingBottom: 5,
  },
  entradaHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  entradaImage: {
    width: "80%",
    aspectRatio: 16 / 9,
    height: undefined,
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 5,
    alignSelf: "flex-start",
  },
  sectionContainer: {
    borderWidth: 1,
    borderColor: colors.dark[70],
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: colors.dark[80],
    marginBottom: 10,
  },
  detailText: {
    fontSize: 13,
    color: colors.dark[20],
    marginTop: 1,
    marginBottom: 3,
    lineHeight: 18,
  },
});
