import { tableSchema } from "@nozbe/watermelondb";

export const project = tableSchema({
  name: "project",
  columns: [
    { name: "_id", type: "string" },
    { name: "nome_projeto", type: "string" },
    { name: "inicio", type: "string" },
    { name: "descricao_projeto", type: "string" },
    { name: "uploaded", type: "boolean" },
  ],
});