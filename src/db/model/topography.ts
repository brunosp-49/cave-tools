import { Model } from "@nozbe/watermelondb";
import { field, text } from "@nozbe/watermelondb/decorators";

export default class TopographyDrawing extends Model {
  static table = "topography_drawings";

  @field("topography_id") topographyId!: string;
  @field("cavity_id") cavity_id!: string;
  @text("drawing_data") drawing_data!: string;
  @field("is_draft") is_draft!: boolean;
  @field("date") date!: string;
  @field("uploaded") uploaded!: boolean;
}
