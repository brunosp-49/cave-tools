import { tableSchema } from "@nozbe/watermelondb";

const cavityRegister = tableSchema({
  name: "cavity_register",
  columns: [
    { name: "cavidade_id", type: "string" },
    { name: "registro_id", type: "string"},
    { name: "projeto_id", type: "string"},
    { name: "responsavel", type: "string" },
    { name: "nome_cavidade", type: "string" },
    { name: "nome_sistema", type: "string" },
    { name: "data", type: "string" },
    { name: "municipio", type: "string" },
    { name: "uf", type: "string" },
    { name: "localidade", type: "string" },
    { name: "entradas", type: "string" },
    { name: "desenvolvimento_linear", type: "number" },
    { name: "dificuldades_externas", type: "string" },
    { name: "aspectos_socioambientais", type: "string" },
    { name: "caracterizacao_interna", type: "string" },
    { name: "topografia", type: "string" },
    { name: "morfologia", type: "string" },
    { name: "hidrologia", type: "string" },
    { name: "sedimentos", type: "string" },
    { name: "espeleotemas", type: "string" },
    { name: "biota", type: "string" },
    { name: "arqueologia", type: "string" },
    { name: "paleontologia", type: "string" },
    { name: "status", type: "string" },
    {name: "uploaded", type: "boolean"},
  ],
});

export default cavityRegister;