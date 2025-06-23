import { Model } from "@nozbe/watermelondb";
import { field, json, text } from "@nozbe/watermelondb/decorators";

// Define the Cavidade Model
export default class CavityRegister extends Model {
  static table = "cavity_register";
  @text("cavidade_id") cavidade_id!: string; // Current mutable ID
  @text("registro_id") registro_id!: string; // Original UUID (stable)
  @text("projeto_id") projeto_id!: string; // Foreign key to Project

  @text("responsavel") responsavel!: string;
  @text("nome_cavidade") nome_cavidade!: string;
  @text("nome_sistema") nome_sistema!: string;
  @text("data") data!: string;
  @text("municipio") municipio!: string;
  @text("uf") uf!: string;
  @text("localidade") localidade?: string; // Optional string field

  @json("entradas", (rawJson) => rawJson) entradas!: any; // JSON string parsed to object

  @field("desenvolvimento_linear") desenvolvimento_linear?: number; // Number field, optional

  // Use @json for optional JSON string fields
  @json("dificuldades_externas", (rawJson) => rawJson) dificuldades_externas?: any;
  @json("aspectos_socioambientais", (rawJson) => rawJson) aspectos_socioambientais?: any;
  @json("caracterizacao_interna", (rawJson) => rawJson) caracterizacao_interna?: any;
  @json("topografia", (rawJson) => rawJson) topografia?: any;
  @json("morfologia", (rawJson) => rawJson) morfologia?: any;
  @json("hidrologia", (rawJson) => rawJson) hidrologia?: any;
  @json("sedimentos", (rawJson) => rawJson) sedimentos?: any;
  @json("espeleotemas", (rawJson) => rawJson) espeleotemas?: any;
  @json("biota", (rawJson) => rawJson) biota?: any;
  @json("arqueologia", (rawJson) => rawJson) arqueologia?: any;
  @json("paleontologia", (rawJson) => rawJson) paleontologia?: any;

  @text("status") status?: string; // Optional string field
  @field("uploaded") uploaded!: boolean; // Boolean field
}
