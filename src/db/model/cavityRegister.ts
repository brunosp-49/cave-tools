import { Model } from "@nozbe/watermelondb";
import { field } from "@nozbe/watermelondb/decorators";

// Define the Cavidade Model
export default class CavityRegister extends Model {
  static table = "cavity_register";
  @field("registro_id") registro_id!: string;
  @field("projeto_id") projeto_id!: string;
  @field("responsavel") responsavel!: string;
  @field("nome_cavidade") nome_cavidade!: string;
  @field("nome_sistema") nome_sistema!: string;
  @field("data") data!: string;
  @field("municipio") municipio!: string;
  @field("uf") uf!: string;
  @field("localidade") localidade?: string;
  @field("entradas") entradas!: string;
  @field("desenvolvimento_linear") desenvolvimento_linear?: number;
  @field("dificuldades_externas") dificuldades_externas?: string;
  @field("aspectos_socioambientais") aspectos_socioambientais?: string;
  @field("caracterizacao_interna") caracterizacao_interna?: string;
  @field("topografia") topografia?: string;
  @field("morfologia") morfologia?: string;
  @field("hidrologia") hidrologia?: string;
  @field("sedimentos") sedimentos?: string;
  @field("espeleotemas") espeleotemas?: string;
  @field("biota") biota?: string;
  @field("arqueologia") arqueologia?: string;
  @field("paleontologia") paleontologia?: string;
  @field("uploaded") uploaded!: boolean;
}
