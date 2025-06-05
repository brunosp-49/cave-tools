import { tableSchema } from "@nozbe/watermelondb";

export const topography = tableSchema({
  name: "topography",
  columns: [
    { name: "_id", type: "string" },
    { name: "cavity_id", type: "string" },
    { name: "registro_id", type: "string" },
    { name: "data", type: "string" },
    { name: "from", type: "string" },
    { name: "to", type: "string" },
    { name: "distance", type: "string" },
    { name: "azimuth", type: "string" },
    { name: "incline", type: "string" },
    { name: "turnUp", type: "string" },
    { name: "turnDown", type: "string" },
    { name: "turnRight", type: "string" },
    { name: "turnLeft", type: "string" }
  ],
});
