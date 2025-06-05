import { user } from "./../db/schemas/user"; // Assuming this path is correct
import { DrawerNavigationProp } from "@react-navigation/drawer";

export interface SvgIconProps {
  size?: number;
  disabled?: boolean;
}

export interface RouterProps {
  navigation: DrawerNavigationProp<any, any>;
  route?: any;
}

export type TopographyPoint = {
  cavity_id: string;
  from: string;
  to: string;
  distance: string;
  azimuth: string;
  incline: string;
  turnUp: string;
  turnDown: string;
  turnRight: string;
  turnLeft: string;
};

export interface TableTopographyProps {
  topography: TopographyPoint[];
}

export interface TopographyData {
  registro_id: string; // Required, will be used as the primary ID
  cavity_id: string;
  data: string;
  from: string;
  to: string;
  distance: string;
  azimuth: string;
  incline: string;
  turnUp: string;
  turnDown: string;
  turnRight: string;
  turnLeft: string;
}

export interface UserModel {
  token: string;
  refresh_token: string;
  user_id: string | number;
  last_login_date?: string; // ISO date string
  user_name: string;
}

export interface Insercao {
  afloramento_rochoso_continuo?: boolean;
  afloramento_isolado?: boolean;
  escarpa_rochosa_continua?: boolean;
  escarpa_rochosa_descontinua?: boolean;
  dolina?: boolean;
  deposito_talus?: boolean;
  outro?: string;
}

export interface Posicao_vertente {
  topo?: boolean;
  alta?: boolean;
  media?: boolean;
  baixa?: boolean;
}

export interface Vegetacao {
  cerrado?: boolean;
  campo_rupestre?: boolean;
  floresta_estacional_semidecidual?: boolean;
  floresta_ombrofila?: boolean;
  mata_seca?: boolean;
  campo_sujo?: boolean;
  outro?: string;
}

export interface Dificuldades_externas {
  rastejamento?: boolean;
  quebra_corpo?: boolean;
  teto_baixo?: boolean;
  natacao?: boolean;
  sifao?: boolean;
  blocos_instaveis?: boolean;
  lances_verticais?: boolean;
  cachoeira?: boolean;
  trechos_escorregadios?: boolean;
  passagem_curso_agua?: boolean;
  outroEnabled?: boolean;
  outro?: string;
  nenhuma?: boolean;
}

export interface GeneralSelectOption<T = any> {
  id: string | number;
  value: T;
  label: string;
}

export interface Uso_cavidade {
  religioso?: boolean;
  cientifico_cultural?: boolean;
  social?: boolean;
  minerario?: boolean;
  pedagogico?: boolean;
  esportivo?: boolean;
  turistico?: boolean;
  incipiente?: boolean;
  massa?: boolean;
  aventura?: boolean;
  mergulho?: boolean;
  rapel?: boolean;
  outroEnabled?: boolean;
  outro?: string;
}

export interface Area_protegida {
  federal?: {
    nome?: string;
    zona?: "interior" | "zona_de_amortecimento";
  };
  estadual?: {
    nome?: string;
    zona?: "interior" | "zona_de_amortecimento";
  };
  municipal?: {
    nome?: string;
    zona?: "interior" | "zona_de_amortecimento";
  };
  nao_determinado?: boolean;
}

export interface Infraestrutura_acesso {
  receptivo?: boolean;
  condutor_para_visitantes?: boolean;
  lanchonete_ou_restaurante?: boolean;
  pousada_ou_hotel?: boolean;
  nenhuma?: boolean;
}

export interface Infraestrutura_interna {
  passarela?: boolean;
  corrimao?: {
    ferro?: boolean;
    madeira?: boolean;
    corda?: boolean;
    outro?: string;
  };
  portao?: boolean;
  escada?: boolean;
  corda?: boolean; // This seems like a duplicate of corrimao.corda, clarify if distinct
  iluminacao_artificial?: boolean;
  ponto_ancoragem?: boolean;
  outros?: string;
  outroEnabled?: boolean;
  nenhuma?: boolean;
}

export interface Dificuldades_progressao_interna {
  teto_baixo?: boolean;
  blocos_instaveis?: boolean;
  trechos_escorregadios?: boolean;
  rastejamento?: boolean;
  natacao?: boolean;
  lances_verticais?: boolean;
  passagem_curso_agua?: boolean;
  quebra_corpo?: boolean;
  sifao?: boolean;
  cachoeira?: boolean;
  nenhuma?: boolean;
  outro?: string;
}

export interface Padrao_planimetrico_predominante {
  retilinea?: boolean;
  anastomosada?: boolean;
  espongiforme?: boolean;
  labirintica?: boolean;
  reticulado?: boolean;
  ramiforme?: boolean;
  dendritico?: boolean;
  outro?: string;
}

export interface Forma_predominante {
  circular?: boolean;
  eliptica_vertical?: boolean;
  eliptica_horizontal?: boolean;
  eliptica_inclinada?: boolean;
  lenticular_vertical?: boolean;
  lenticular_horizontal?: boolean;
  poligonal?: boolean;
  poligonal_tabular?: boolean;
  triangular?: boolean;
  fechadura?: boolean;
  linear_inclinada?: boolean;
  linear_vertical?: boolean;
  irregular?: boolean;
  mista?: boolean;
  outro?: string;
}

export interface Grupo_litologico {
  rochas_carbonaticas?: boolean;
  rochas_ferriferas_ferruginosas?: boolean;
  rochas_siliciclasticas?: boolean;
  rochas_peliticas?: boolean;
  rochas_granito_gnaissicas?: boolean;
  outro?: string;
}

export interface HidrologiaFeature {
  // Renamed from your auxiliary types for clarity
  possui?: boolean;
  tipo?: "perene" | "intermitente" | "nao_soube_informar";
}

export interface Hidrologia {
  curso_agua?: HidrologiaFeature;
  lago?: HidrologiaFeature;
  sumidouro?: HidrologiaFeature;
  surgencia?: HidrologiaFeature;
  gotejamento?: HidrologiaFeature;
  condensacao?: HidrologiaFeature;
  empossamento?: HidrologiaFeature;
  exudacao?: HidrologiaFeature;
  outro?: string;
}

export interface SedimentoDetalhe {
  distribuicao?: "generalizado" | "localizado";
  origem?: "autoctone" | "aloctone" | "mista";
}

export interface GuanoTipoDetalhe {
  // Renamed from your auxiliary GuanoTipo
  possui?: boolean;
  tipo?: "seco_manchado" | "seco_esparso" | "umido_manchado" | "umido_esparso";
}

export interface GuanoDetalhe {
  // Renamed from your auxiliary Guano
  carnivoro?: GuanoTipoDetalhe;
  frugivoro?: GuanoTipoDetalhe;
  hematofago?: GuanoTipoDetalhe;
  inderterminado?: GuanoTipoDetalhe; // Typo from original, consider 'indeterminado'
}

export interface SedimentacaoClasticaTipo {
  rochoso?: boolean;
  argila?: SedimentoDetalhe;
  silte?: SedimentoDetalhe;
  areia?: SedimentoDetalhe;
  fracao_granulo?: SedimentoDetalhe;
  seixo_predominante?: SedimentoDetalhe;
  fracao_calhau?: SedimentoDetalhe;
  matacao_predominante?: SedimentoDetalhe;
}

export interface SedimentacaoOrganicaTipo {
  guano?: GuanoDetalhe;
  folhico?: boolean;
  galhos?: boolean;
  raizes?: boolean;
  vestigios_ninhos?: boolean;
  pelotas_regurgitacao?: boolean;
}

export interface Sedimentos {
  sedimentacao_clastica?: {
    possui?: boolean;
    tipo?: SedimentacaoClasticaTipo;
    outros?: string;
    outroEnabled?: boolean;
  };
  sedimentacao_organica?: {
    possui?: boolean;
    tipo?: SedimentacaoOrganicaTipo;
    outros?: string;
    outroEnabled?: boolean;
  };
}

export interface EspeleotemaItem {
  id: number; // Unique ID for list management
  tipo: string;
  porte?: "milimetrico" | "centimetrico" | "metrico";
  frequencia?: string;
  estado_conservacao?: string;
}

export interface Invertebrado {
  // As per instruction 5
  possui?: boolean;
  aranha?: boolean;
  acaro?: boolean;
  amblipigio?: boolean;
  opiliao?: boolean;
  pseudo_escorpiao?: boolean;
  escorpiao?: boolean;
  formiga?: boolean;
  besouro?: boolean;
  mosca?: boolean;
  mosquito?: boolean;
  mariposa?: boolean;
  barata?: boolean;
  cupim?: boolean;
  grilo?: boolean;
  percevejo?: boolean;
  piolho_de_cobra?: boolean;
  centopeia?: boolean;
  lacraia?: boolean;
  caramujo_terrestre?: boolean;
  tatuzinho_de_jardim?: boolean;
  outroEnabled?: boolean;
  outro?: string;
}

export interface InvertebradoAquatico {
  // As per instruction 6
  possui?: boolean;
  caramujo_aquatico?: boolean;
  bivalve?: boolean;
  camarao?: boolean;
  caranguejo?: boolean;
  outroEnabled?: boolean;
  outro?: string;
}

export interface Biota {
  invertebrado?: Invertebrado; // Changed
  invertebrado_aquatico?: InvertebradoAquatico; // Changed
  anfibios?: {
    possui?: boolean;
    tipos?: string[];
    outroEnabled?: boolean;
    outro?: string;
  };
  repteis?: {
    possui?: boolean;
    tipos?: string[];
    outroEnabled?: boolean;
    outro?: string;
  };
  aves?: {
    possui?: boolean;
    tipos?: string[];
    outroEnabled?: boolean;
    outro?: string;
  };
  peixes?: boolean;
  morcegos?: {
    possui?: boolean;
    tipos?: {
      tipo:
        | "frugivoro"
        | "hematofago"
        | "carnivoro"
        | "nectarivoro"
        | "insetivoro"
        | "piscivoro"
        | "indeterminado";
      quantidade: "individuo" | "grupo" | "colonia" | "colonia_grande";
    }[];
    observacoes_gerais?: string;
  };
}

export interface Arqueologia {
  possui?: boolean;
  tipos?: {
    material_litico?: boolean;
    material_ceramico?: boolean;
    pintura_rupestre?: boolean;
    gravura?: boolean;
    ossada_humana?: boolean;
    enterramento?: boolean;
    nao_identificado?: boolean;
    outroEnabled?: boolean;
    outro?: string;
  };
}

export interface Paleontologia {
  possui?: boolean;
  tipos?: {
    ossada?: boolean;
    iconofossil?: boolean;
    jazigo?: boolean;
    nao_identificado?: boolean;
    outroEnabled?: boolean;
    outro?: string;
  };
}

export interface CaracterizacaoInterna {
  // Main definition for this structure
  grupo_litologico?: Grupo_litologico;
  desenvolvimento_predominante?: string;
  depredacao_localizada?: boolean; // Changed
  descricao_depredacao_localizada?: string; // Changed
  depredacao_intensa?: boolean; // Changed
  descricao_depredacao_intensa?: string; // Changed
  infraestrutura_interna?: Infraestrutura_interna; // Reference to the single Infraestrutura_interna
  dificuldades_progressao_interna?: Dificuldades_progressao_interna;
}

export interface Entrada {
  // Main definition for an Entrada
  principal: boolean;
  foto: string | null;
  nome: string;
  coordenadas: {
    datum: string;
    coleta_automatica: boolean;
    graus_e: number;
    graus_n: number;
    erro_gps: number;
    satelites: number;
    utm: {
      zona: string;
      utm_e: number;
      utm_n: number;
      erro_gps: number;
      satelites: number;
      elevacao: number;
    };
  };
  caracteristicas: {
    insercao: Insercao;
    posicao_vertente: Posicao_vertente;
    vegetacao: Vegetacao;
  };
}

export interface AspectosSocioambientais {
  // Main definition
  uso_cavidade: Uso_cavidade; // Not optional inside if AspectosSocioambientais exists
  comunidade_envolvida?: {
    envolvida: boolean; // Should be boolean, not boolean | undefined if object exists
    descricao?: string;
  };
  area_protegida: Area_protegida; // Not optional inside
  infraestrutura_acesso: Infraestrutura_acesso; // Not optional inside
}

export interface Cavidade {
  registro_id: string;
  projeto_id: string; // Removed as per instruction 3
  responsavel: string;
  nome_cavidade: string;
  nome_sistema: string;
  data: string;
  municipio: string;
  uf: string;
  localidade?: string;
  entradas: Entrada[]; // Use the defined Entrada interface
  desenvolvimento_linear?: number;
  dificuldades_externas?: Dificuldades_externas;
  aspectos_socioambientais?: AspectosSocioambientais; // Use defined AspectosSocioambientais
  caracterizacao_interna?: CaracterizacaoInterna; // Use defined CaracterizacaoInterna
  topografia?: {
    espeleometria: {
      // Consider Espeleometria interface
      projecao_horizontal?: number;
      desnivel_piso?: number;
      area?: number;
      volume?: number;
    };
    previsao?: {
      // Consider Previsao interface
      bcra?: string;
      uis?: string;
    };
  };
  morfologia?: {
    // Consider MorfologiaData interface
    padrao_planimetrico: Padrao_planimetrico_predominante; // Not optional inside
    forma_secoes: Forma_predominante; // Not optional inside
  };
  hidrologia?: Hidrologia;
  sedimentos?: Sedimentos;
  espeleotemas?: {
    // Consider Espeleotemas interface
    possui?: boolean;
    tipos?: EspeleotemaItem[];
  };
  biota?: Biota;
  arqueologia?: Arqueologia;
  paleontologia?: Paleontologia;
}

export interface Espeleometria {
  projecao_horizontal?: number;
  desnivel_piso?: number;
  area?: number;
  volume?: number;
}

export interface Previsao {
  bcra?: string;
  uis?: string;
}

export interface Topografia {
  // Auxiliary type if needed for forms
  espeleometria: Espeleometria;
  previsao?: Previsao;
}

export interface MorfologiaData {
  // Auxiliary type if needed for forms
  padrao_planimetrico: Padrao_planimetrico_predominante;
  forma_secoes: Forma_predominante;
}

export interface RadioButtonOption<T = string> {
  id: string;
  value: T;
  label: string;
}

export interface SelectOption<T = any> {
  id: string | number;
  value: T;
  label: string;
}

// For Redux Slice and StepNine logic
export type BiotaStandardCategoryKey = keyof Pick<
  Biota,
  "anfibios" | "repteis" | "aves"
>;
export type BiotaCustomObjectCategoryKey = keyof Pick<
  Biota,
  "invertebrado" | "invertebrado_aquatico"
>;

export type BatQuantidadeType =
  | "individuo"
  | "grupo"
  | "colonia"
  | "colonia_grande";

export type BatFeedingType = NonNullable<
  NonNullable<NonNullable<Biota["morcegos"]>["tipos"]>[number]["tipo"]
>;

export const batQuantidadeOptions: SelectOption<BatQuantidadeType | "">[] = [
  { id: "placeholder", value: "", label: "Selecione Quantidade..." },
  { id: "individuo", value: "individuo", label: "Indivíduo" },
  { id: "grupo", value: "grupo", label: "Grupo Pequeno (<50)" },
  { id: "colonia", value: "colonia", label: "Colônia (50-1000)" },
  {
    id: "colonia_grande",
    value: "colonia_grande",
    label: "Colônia Grande (>1000)",
  },
];

export interface ProjectPayload {
  // For creating/updating project info
  id: string | number;
  nome_projeto: string;
  inicio: string; // ISO date string
  descricao_projeto: string;
  status: string;
}

export interface ProjectModel extends ProjectPayload {
  // Represents project in local DB
  _id: string; // Usually for WatermelonDB internal ID
  uploaded?: boolean;
}

// For the controller function createCavityRegister (data passed from frontend to controller)
// And for fetchAllCavities's return type item (parsed from DB)
export interface CavityRegisterData {
  registro_id: string;
  projeto_id: string; // Removed
  responsavel: string;
  nome_cavidade: string;
  nome_sistema: string;
  data: string; // ISO Date string
  municipio: string;
  uf: string;
  localidade?: string;
  // Fields that are JSON stringified in the DB
  entradas: string; // stringified Entrada[]
  desenvolvimento_linear?: number | null;
  dificuldades_externas?: string; // stringified Dificuldades_externas
  aspectos_socioambientais?: string; // stringified AspectosSocioambientais
  caracterizacao_interna?: string; // stringified CaracterizacaoInterna
  topografia?: string; // stringified Topografia
  morfologia?: string; // stringified MorfologiaData
  hidrologia?: string; // stringified Hidrologia
  sedimentos?: string; // stringified Sedimentos
  espeleotemas?: string; // stringified Espeleotemas type
  biota?: string; // stringified Biota
  arqueologia?: string; // stringified Arqueologia
  paleontologia?: string; // stringified Paleontologia
}

// For the controller function syncConsolidatedUpload (payload to backend API)
export interface UploadProjectPayload {
  _id: string;
  nome_projeto: string;
  inicio: string; // ISO date string
  descricao_projeto: string;
  status: string;
  cavities: Cavidade[]; // Array of fully-formed Cavidade objects
}

// The following are likely auxiliary types for specific form sections.
// Ensure they are consistent with the main Cavidade sub-types.
// If Cavidade's sub-types are sufficient, these might not be needed or should exactly match.

export interface Espeleotemas {
  // Auxiliary
  possui?: boolean;
  tipos?: EspeleotemaItem[];
}

// Redundant if CaracterizacaoInterna above is used as the single source of truth.
// export interface CaracterizacaoInternaForm {
//   grupo_litologico?: Grupo_litologico;
//   desenvolvimento_predominante?: string;
//   depredacao_localizada?: boolean;
//   descricao_depredacao_localizada?: string;
//   depredacao_intensa?: boolean;
//   descricao_depredacao_intensa?: string;
//   infraestrutura_interna?: Infraestrutura_interna;
//   dificuldades_progressao_interna?: Dificuldades_progressao_interna;
// }

// Redundant
// export interface Dificuldades_externas { ... }
// export interface Uso_cavidade { ... }
// export interface Area_protegida { ... }

// Redundant if AspectosSocioambientais above is the single source of truth.
// export interface AspectosSocioambientaisForm {
//   uso_cavidade?: Uso_cavidade;
//   comunidade_envolvida?: {
//     envolvida?: boolean;
//     descricao?: string;
//   };
//   area_protegida?: Area_protegida;
//   infraestrutura_acesso?: Infraestrutura_acesso;
// }

// Redundant
// export interface PadraoPlanimetrico { ... }
// export interface FormaSecoes { ... }
// export interface MorfologiaData { ... }
// export interface HidrologiaFeature { ... }
// export interface HidrologiaData { ... }
// export interface SedimentoDetalhe { ... }
// export interface GuanoTipo { ... } // Renamed to GuanoTipoDetalhe
// export interface SedimentacaoClasticaTipo { ... }
// export interface SedimentacaoClastica { ... }
// export interface Guano { ... } // Renamed to GuanoDetalhe
// export interface SedimentacaoOrganicaTipo { ... }
// export interface SedimentacaoOrganica { ... }
// export interface SedimentosData { ... }
