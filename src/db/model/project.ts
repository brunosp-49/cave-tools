import { Model } from "@nozbe/watermelondb";
import { field } from "@nozbe/watermelondb/decorators";

export default class Project extends Model {
  static table = "project";

  @field("_id") _id!: string;
  @field("fk_cliente") fk_cliente!: string;
  @field("nome_projeto") nome_projeto!: string;
  @field("inicio") inicio!: string;
  @field("descricao_projeto") descricao_projeto!: string;
  @field("uploaded") uploaded!: boolean;
}
