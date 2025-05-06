import { tableSchema } from "@nozbe/watermelondb";

export const project = tableSchema({
  name: "project",
  columns: [
    { name: "_id", type: "number" },
    { name: "fk_cliente", type: "number" },
    { name: "nome_projeto", type: "string" },
    { name: "inicio", type: "string" },
    { name: "descricao_projeto", type: "string" },
    { name: "uploaded", type: "boolean" },
  ],
});