import { user } from './../db/schemas/user';
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
  from: number;
  to: number;
  distance: number;
  azimuth: number;
  incline: number;
  turnUp: number;
  turnDown: number;
  turnRight: number;
  turnLeft: number;
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
  outro?: string; // Texto livre, máx. 100 caracteres
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
  outro?: string; // Texto livre, máx. 100 caracteres
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
  outro?: string; // Texto livre, máx. 50 caracteres
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
  nao_determinado?: boolean; // "Não foi possível determinar"
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
    outro?: string; // Texto livre, máx. 50 caracteres
  };
  portao?: boolean;
  escada?: boolean;
  corda?: boolean;
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
  outro?: string; // Texto livre, máx. 50 caracteres
}

export interface Padrao_planimetrico_predominante {
  retilinea?: boolean;
  anastomosada?: boolean;
  espongiforme?: boolean;
  labirintica?: boolean;
  reticulado?: boolean;
  ramiforme?: boolean;
  dendritico?: boolean;
  outro?: string; // Texto livre, máx. 50 caracteres
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
  outro?: string; // Texto livre, máx. 50 caracteres
}

export interface Grupo_litologico {
  rochas_carbonaticas?: boolean;
  rochas_ferriferas_ferruginosas?: boolean;
  rochas_siliciclasticas?: boolean;
  rochas_peliticas?: boolean;
  rochas_granito_gnaissicas?: boolean;
  outro?: string; // Texto livre, máx. 100 caracteres
}

export interface Hidrologia {
  curso_agua?: {
    possui?: boolean;
    tipo?: "perene" | "intermitente" | "nao_soube_informar";
  };
  lago?: {
    possui?: boolean;
    tipo?: "perene" | "intermitente" | "nao_soube_informar";
  };
  sumidouro?: {
    possui?: boolean;
    tipo?: "perene" | "intermitente" | "nao_soube_informar";
  };
  surgencia?: {
    possui?: boolean;
    tipo?: "perene" | "intermitente" | "nao_soube_informar";
  };
  gotejamento?: {
    possui?: boolean;
    tipo?: "perene" | "intermitente" | "nao_soube_informar";
  };
  condensacao?: {
    possui?: boolean;
    tipo?: "perene" | "intermitente" | "nao_soube_informar";
  };
  empossamento?: {
    possui?: boolean;
    tipo?: "perene" | "intermitente" | "nao_soube_informar";
  };
  exudacao?: {
    possui?: boolean;
    tipo?: "perene" | "intermitente" | "nao_soube_informar";
  };
  outro?: string; // Texto livre, máx. 100 caracteres
}

export interface Sedimentos {
  sedimentacao_clastica?: {
    possui?: boolean;
    tipo?: {
      rochoso?: boolean;
      argila?: {
        distribuicao?: "generalizado" | "localizado";
        origem?: "autoctone" | "aloctone" | "mista";
      };
      silte?: {
        distribuicao?: "generalizado" | "localizado";
        origem?: "autoctone" | "aloctone" | "mista";
      };
      areia?: {
        distribuicao?: "generalizado" | "localizado";
        origem?: "autoctone" | "aloctone" | "mista";
      };
      fracao_granulo?: {
        distribuicao?: "generalizado" | "localizado";
        origem?: "autoctone" | "aloctone" | "mista";
      };
      seixo_predominante?: {
        distribuicao?: "generalizado" | "localizado";
        origem?: "autoctone" | "aloctone" | "mista";
      };
      fracao_calhau?: {
        distribuicao?: "generalizado" | "localizado";
        origem?: "autoctone" | "aloctone" | "mista";
      };
      matacao_predominante?: {
        distribuicao?: "generalizado" | "localizado";
        origem?: "autoctone" | "aloctone" | "mista";
      };
    };
    outros?: string;
    outroEnabled?: boolean;
  };
  sedimentacao_organica?: {
    possui?: boolean;
    tipo?: {
      guano?: {
        carnivoro?: {
          possui?: boolean;
          tipo:
            | "seco_manchado"
            | "seco_esparso"
            | "umido_manchado"
            | "umido_esparso";
        };
        frugivoro?: {
          possui?: boolean;
          tipo:
            | "seco_manchado"
            | "seco_esparso"
            | "umido_manchado"
            | "umido_esparso";
        };
        hematofago?: {
          possui?: boolean;
          tipo:
            | "seco_manchado"
            | "seco_esparso"
            | "umido_manchado"
            | "umido_esparso";
        };
        inderterminado?: {
          possui?: boolean;
          tipo:
            | "seco_manchado"
            | "seco_esparso"
            | "umido_manchado"
            | "umido_esparso";
        };
      };
      folhico?: boolean;
      galhos?: boolean;
      raizes?: boolean;
      vestigios_ninhos?: boolean;
      pelotas_regurgitacao?: boolean;
    };
    outros?: string;
    outroEnabled?: boolean;
  };
}

export interface EspeleotemaItem {
  id: number;
  tipo: string;
  porte?: "milimetrico" | "centimetrico" | "metrico";
  frequencia?: string;
  estado_conservacao?: string;
}

export interface Biota {
  invertebrados?: {
    possui?: boolean;
    tipos?: string[]; // Lista de tipos (e.g., "aranha", "besouro")
    outroEnabled?: boolean;
    outro?: string; // Texto livre, máx. 100 caracteres
  };
  invertebrados_aquaticos?: {
    possui?: boolean;
    tipos?: string[]; // Lista de tipos (e.g., "camarao", "caramujo")
    outroEnabled?: boolean;
    outro?: string; // Texto livre, máx. 100 caracteres
  };
  anfibios?: {
    possui?: boolean;
    tipos?: string[]; // Lista de tipos (e.g., "sapo", "perereca")
    outroEnabled?: boolean;
    outro?: string; // Texto livre, máx. 100 caracteres
  };
  repteis?: {
    possui?: boolean;
    tipos?: string[]; // Lista de tipos (e.g., "serpente", "lagarto")
    outroEnabled?: boolean;
    outro?: string; // Texto livre, máx. 100 caracteres
  };
  aves?: {
    possui?: boolean;
    tipos?: string[]; // Lista de tipos (e.g., "urubu", "coruja")
    outroEnabled?: boolean;
    outro?: string; // Texto livre, máx. 100 caracteres
  };
  peixes?: boolean; // Se possui peixes
  morcegos?: {
    possui?: boolean;
    tipos?: {
      // Now an array of objects
      tipo:
        | "frugivoro"
        | "hematofago"
        | "carnivoro"
        | "nectarivoro"
        | "insetivoro"
        | "piscivoro"
        | "indeterminado";
      quantidade: "individuo" | "grupo" | "colonia" | "colonia_grande";
    }[]; // <-- Note the '[]' indicating an array
    observacoes_gerais?: string; // New optional field
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
    outro?: string; // Texto livre, máx. 100 caracteres
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
    outro?: string; // Texto livre, máx. 100 caracteres
  };
}

export interface Cavidade {
  registro_id: string; // Gerado automaticamente pelo sistema
  projeto_id: string; // Campo obrigatório
  responsavel: string; // Campo obrigatório
  nome_cavidade: string; // Campo obrigatório
  nome_sistema: string; // Gerado automaticamente pelo sistema
  data: string; // Auto-populado
  municipio: string; // Auto-populado
  uf: string; // Auto-populado
  localidade?: string; // Campo opcional
  entradas: {
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
  }[];
  desenvolvimento_linear?: number;
  dificuldades_externas?: Dificuldades_externas;
  aspectos_socioambientais?: {
    uso_cavidade: Uso_cavidade;
    comunidade_envolvida?: {
      envolvida: boolean;
      descricao?: string;
    };
    area_protegida: Area_protegida;
    infraestrutura_acesso: Infraestrutura_acesso;
  };
  caracterizacao_interna?: {
    grupo_litologico: Grupo_litologico;
    desenvolvimento_predominante?: string;
    estado_conservacao?: string;
    estado_conservacao_detalhes?: string;
    infraestrutura_interna: Infraestrutura_interna;
    dificuldades_progressao_interna: Dificuldades_progressao_interna;
  };
  topografia?: {
    espeleometria: {
      projecao_horizontal?: number;
      desnivel_piso?: number;
      area?: number;
      volume?: number;
    };
    previsao?: {
      bcra?: string;
      uis?: string;
    };
  };
  morfologia?: {
    padrao_planimetrico: Padrao_planimetrico_predominante;
    forma_secoes: Forma_predominante;
  };
  hidrologia?: Hidrologia;
  sedimentos?: Sedimentos;
  espeleotemas?: {
    possui?: boolean;
    lista?: EspeleotemaItem[];
  };
  biota?: Biota;
  arqueologia?: Arqueologia;
  paleontologia?: Paleontologia;
}

export interface Entrada {
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
  espeleometria: Espeleometria;
  previsao?: Previsao;
}

export interface Morfologia {
  padrao_planimetrico: Padrao_planimetrico_predominante;
  forma_secoes: Forma_predominante;
}

export interface EspeleotemaItem {
  tipo: string;
  porte?: "milimetrico" | "centimetrico" | "metrico";
  frequencia?: string;
  estado_conservacao?: string;
  // Add a unique ID for easier removal if needed, e.g., using Date.now() or uuid
  id: number;
}

export interface RadioButtonOption<T = string> {
  // Uses a generic <T> for the value type
  id: string; // A unique identifier for the radio button option
  value: T; // The actual data value associated with selecting this option
  label: string; // The text displayed next to the radio button for the user
  // It might have other optional properties like disabled?: boolean; etc.
}

export interface SelectOption<T = any> {
  // Use 'export' ! Use generics <T> if value type varies
  id: string | number; // Use string or number as appropriate for your IDs
  value: T; // The actual value the option represents
  label: string; // The text displayed to the user for the option
  // Add any other properties your Select component might use (e.g., disabled?: boolean)
}

export type BiotaCategoryKey = keyof Pick<
  Biota,
  "invertebrados" | "invertebrados_aquaticos" | "anfibios" | "repteis" | "aves"
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
  id: string | number;
  fk_cliente: string | number;
  nome_projeto: string;
  inicio: string;
  descricao_projeto: string;
  responsavel: string;
}

export interface ProjectModel {
  _id: string;
  fk_cliente: string;
  nome_projeto: string;
  inicio: string;
  descricao_projeto: string;
  responsavel: string;
}

export interface UploadProjectPayload {
  _id: string;
  fk_cliente: string;
  nome_projeto: string;
  inicio: string;
  descricao_projeto: string;
  responsavel: string;
  cavities: Cavidade[];
}

export interface CavityRegisterData {
  registro_id: string; // Required, will be used as the primary ID
  projeto_id: string;
  responsavel: string;
  nome_cavidade: string;
  nome_sistema: string;
  data: string;
  municipio: string;
  uf: string;
  localidade?: string;
  entradas: any; // Replace 'any' with a more specific type if possible (e.g., Array<{description: string}> | string)
  desenvolvimento_linear?: number | null;
  dificuldades_externas?: string; // Specific type? (e.g., string[] | object)
  aspectos_socioambientais?: string; // Specific type?
  caracterizacao_interna?: string; // Specific type?
  topografia?: string; // Specific type?
  morfologia?: string; // Specific type?
  hidrologia?: string; // Specific type?
  sedimentos?: string; // Specific type?
  espeleotemas?: string; // Specific type?
  biota?: string; // Specific type?
  arqueologia?: string; // Specific type?
  paleontologia?: string; // Specific type?
  // NOTE: Do not include 'id' here. The function uses 'registro_id' for that.
}

export interface EspeleotemaItem {
  tipo: string;
  porte?: "milimetrico" | "centimetrico" | "metrico";
  frequencia?: string;
  estado_conservacao?: string;
  id: number;
}

export interface Espeleotemas {
  possui?: boolean;
  lista?: EspeleotemaItem[];
}

export interface CaracterizacaoInterna {
  grupo_litologico?: Grupo_litologico; // Made optional
  desenvolvimento_predominante?: string;
  estado_conservacao?: string;
  estado_conservacao_detalhes?: string;
  infraestrutura_interna?: Infraestrutura_interna; // Made optional
  dificuldades_progressao_interna?: Dificuldades_progressao_interna; // Made optional
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

export interface AspectosSocioambientais {
  uso_cavidade?: Uso_cavidade; // Made optional
  comunidade_envolvida?: {
    envolvida?: boolean; // Made optional
    descricao?: string;
  };
  area_protegida?: Area_protegida; // Made optional
  infraestrutura_acesso?: Infraestrutura_acesso; // Made optional
}

export interface PadraoPlanimetrico {
  retilinea?: boolean;
  anastomosada?: boolean;
  espongiforme?: boolean;
  labirintica?: boolean;
  reticulado?: boolean;
  ramiforme?: boolean;
  dendritico?: boolean;
  outro?: string;
}

export interface FormaSecoes {
  circular?: boolean;
  eliptica_horizontal?: boolean;
  eliptica_vertical?: boolean;
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

export interface MorfologiaData {
  padrao_planimetrico?: PadraoPlanimetrico;
  forma_secoes?: FormaSecoes;
}

export interface HidrologiaFeature {
  possui?: boolean;
  tipo?: "intermitente" | "perene"; // Assuming these are the only types
}

export interface HidrologiaData {
  curso_agua?: HidrologiaFeature;
  lago?: HidrologiaFeature;
  sumidouro?: HidrologiaFeature;
  surgencia?: HidrologiaFeature;
  gotejamento?: HidrologiaFeature;
  empossamento?: HidrologiaFeature;
  condensacao?: HidrologiaFeature;
  exudacao?: HidrologiaFeature;
  outro?: string;
}

export interface SedimentoDetalhe {
  distribuicao?: "generalizado" | "localizado";
  origem?: "mista" | "aloctone" | "autoctone";
}

export interface GuanoTipo {
  possui?: boolean;
  tipo?: "seco_manchado" | "umido_manchado" | "umido_esparso";
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

export interface SedimentacaoClastica {
  possui?: boolean;
  tipo?: SedimentacaoClasticaTipo;
  outros?: string;
  outroEnabled?: boolean;
}

export interface Guano {
  carnivoro?: GuanoTipo;
  frugivoro?: GuanoTipo;
  hematofago?: GuanoTipo;
  inderterminado?: GuanoTipo; // Assuming typo for 'indeterminado' in original data
}

export interface SedimentacaoOrganicaTipo {
  guano?: Guano;
  folhico?: boolean;
  galhos?: boolean;
  raizes?: boolean;
  vestigios_ninhos?: boolean;
  pelotas_regurgitacao?: boolean;
}

export interface SedimentacaoOrganica {
  possui?: boolean;
  tipo?: SedimentacaoOrganicaTipo;
  outros?: string;
  outroEnabled?: boolean;
}

export interface SedimentosData {
  sedimentacao_clastica?: SedimentacaoClastica;
  sedimentacao_organica?: SedimentacaoOrganica;
}
