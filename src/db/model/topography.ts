import { Model } from "@nozbe/watermelondb";
import { field } from "@nozbe/watermelondb/decorators";

export default class Topography extends Model {
  static table = "topography"

  @field("registro_id") registro_id!: string;
  @field("cavity_id") cavity_id!: string;
  @field("data") data!: string;
  @field("from") from!: string;
  @field("to") to!: string;
  @field("distance") distance!: string;
  @field("azimuth") azimuth!: string;
  @field("incline") incline!: string;
  @field("turnUp") turnUp!: string;
  @field("turnDown") turnDown!: string;
  @field("turnRight") turnRight!: string;
  @field("turnLeft") turnLeft!: string;
}
