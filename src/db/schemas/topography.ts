import { tableSchema } from "@nozbe/watermelondb";

export const topography = tableSchema({
  name: "topography_drawings",
  columns: [
    { name: "topography_id", type: "string", isIndexed: true },
    { name: "cavity_id", type: "string", isIndexed: true },
    { name: "drawing_data", type: "string" },
    { name: "is_draft", type: "boolean", isIndexed: true },
    { name: "date", type: "string" },
    { name: "uploaded", type: "boolean" },  
  ],
});
