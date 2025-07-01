import { Model } from "@nozbe/watermelondb";
import { field, text } from "@nozbe/watermelondb/decorators";

export default class Project extends Model {
  static table = "project";

  @text("projeto_id") projeto_id!: string;
  @text("register_id") register_id!: string;
  @text("status") status?: string;
  @text("nome_projeto") nome_projeto!: string;
  @text("inicio") inicio!: string;
  @text("descricao_projeto") descricao_projeto!: string;
  @field("uploaded") uploaded!: boolean;
}
