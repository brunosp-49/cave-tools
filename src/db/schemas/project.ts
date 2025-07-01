import { tableSchema } from "@nozbe/watermelondb";

const project = tableSchema({
  name: "project",
  columns: [
    { name: "projeto_id", type: "string" },
    { name: "register_id", type: "string"  },
    { name: "status", type: "string" },
    { name: "nome_projeto", type: "string" },
    { name: "inicio", type: "string" },
    { name: "descricao_projeto", type: "string" },
    { name: "uploaded", type: "boolean" },  
  ],
});

export default project;