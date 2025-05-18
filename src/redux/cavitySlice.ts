import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Arqueologia,
  BatFeedingType,
  BatQuantidadeType,
  Biota,
  BiotaCategoryKey,
  Cavidade,
  Entrada,
  EspeleotemaItem,
  Paleontologia,
} from "../types";
import { formatDateToInput } from "../util";

const initialSedimentosState = {
  sedimentacao_clastica: {
    possui: false,
    tipo: {},
    outros: undefined as string | undefined,
    outroEnabled: false,
  },
  sedimentacao_organica: {
    possui: false,
    tipo: {},
    outros: undefined as string | undefined,
    outroEnabled: false,
  },
};

const initialCavidadeState: Cavidade = {
  registro_id: "",
  projeto_id: "",
  responsavel: "",
  nome_cavidade: "",
  nome_sistema: "",
  data: formatDateToInput(new Date().toISOString()),
  municipio: "",
  uf: "",
  localidade: undefined,
  entradas: [],
  desenvolvimento_linear: undefined,
  dificuldades_externas: {
    nenhuma: true,
    outroEnabled: false,
    outro: undefined,
  },
  aspectos_socioambientais: {
    uso_cavidade: { outroEnabled: false, outro: undefined },
    comunidade_envolvida: { envolvida: false },
    area_protegida: { nao_determinado: true },
    infraestrutura_acesso: { nenhuma: true },
  },
  caracterizacao_interna: {
    grupo_litologico: {},
    infraestrutura_interna: {
      nenhuma: true,
      outroEnabled: false,
      outros: undefined,
    },
    dificuldades_progressao_interna: { nenhuma: true, outro: undefined },
  },
  topografia: undefined,
  morfologia: undefined,
  hidrologia: undefined,
  sedimentos: initialSedimentosState,
  espeleotemas: {
    possui: false,
    lista: [],
  },
  biota: undefined,
  arqueologia: {
    possui: false,
    tipos: { outroEnabled: false, outro: undefined },
  },
  paleontologia: {
    possui: false,
    tipos: { outroEnabled: false, outro: undefined },
  },
};

interface CavitySliceState {
  currentStep: number;
  cavidade: Cavidade;
  isLoading: boolean;
  error: string | null;
}

const initialState: CavitySliceState = {
  currentStep: 0,
  cavidade: initialCavidadeState,
  isLoading: false,
  error: null,
};

interface UpdateDataPayload {
  path: (string | number)[];
  value: any;
}

const cavitySlice = createSlice({
  name: "cavity",
  initialState,
  reducers: {
    updateCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    updateCavidadeData: (state, action: PayloadAction<UpdateDataPayload>) => {
      const { path, value } = action.payload;
      state.error = null;
      let current = state.cavidade as any;

      try {
        for (let i = 0; i < path.length - 1; i++) {
          const key = path[i];
          const nextKey = path[i + 1]; // Look ahead to see if next key implies an array
          if (current[key] === undefined || current[key] === null) {
            current[key] = typeof nextKey === "number" ? [] : {};
          }
          current = current[key];
        }

        if (path.length > 0) {
          const finalKey = path[path.length - 1];
          if (current !== undefined && current !== null) {
            current[finalKey] = value;
          } else {
            console.error(
              `Parent object/array is null or undefined at path: ${path
                .slice(0, -1)
                .join(".")}`
            );
            state.error = `Error updating data: Parent path not fully initialized for ${path.join(
              "."
            )}`;
          }
        } else {
          console.error("updateCavidadeData received an empty path.");
          state.error = "Error updating data: Received empty path.";
        }
      } catch (error: any) {
        console.error("Error updating cavity data:", { path, value, error });
        state.error =
          error.message || `Failed to update field at path: ${path.join(".")}`;
      }
    },
    resetCavidadeState: () => {
      return initialState;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addEntrada: (state, action: PayloadAction<Entrada>) => {
      const newEntry = action.payload;
      const isFirstEntry = state.cavidade.entradas.length === 0;
      // Ensure coordinates and utm objects exist if needed by default
      // You might want to initialize these within CavityModal before dispatching
      const entryWithPrincipal: Entrada = {
        ...newEntry,
        principal: isFirstEntry,
        // Example deep initialization if needed, better done before dispatch
        // coordenadas: newEntry.coordenadas ?? { datum: 'WGS84', /* other defaults */ },
      };
      state.cavidade.entradas.push(entryWithPrincipal);
    },
    removeEntrada: (state, action: PayloadAction<number>) => {
      const indexToRemove = action.payload;
      if (
        indexToRemove < 0 ||
        indexToRemove >= state.cavidade.entradas.length
      ) {
        console.warn(
          `Attempted to remove entrada at invalid index: ${indexToRemove}`
        );
        state.error = `Invalid index ${indexToRemove} for removing entrada.`;
        return;
      }

      const wasPrincipal = state.cavidade.entradas[indexToRemove].principal;
      state.cavidade.entradas.splice(indexToRemove, 1); // Remove the element

      // If the removed was principal and there are remaining entries, make the new first one principal
      if (wasPrincipal && state.cavidade.entradas.length > 0) {
        if (!state.cavidade.entradas.some((entry) => entry.principal)) {
          state.cavidade.entradas[0].principal = true;
        }
      }
    },
    setEntradaPrincipal: (state, action: PayloadAction<number>) => {
      const indexToSet = action.payload;
      if (indexToSet < 0 || indexToSet >= state.cavidade.entradas.length) {
        console.warn(
          `Attempted to set principal on invalid index: ${indexToSet}`
        );
        state.error = `Invalid index ${indexToSet} for setting principal entrada.`;
        return;
      }
      state.cavidade.entradas.forEach((entry, index) => {
        entry.principal = index === indexToSet;
      });
    },
    setBiotaPossui: (
      state,
      action: PayloadAction<{ category: keyof Biota; possui: boolean }>
    ) => {
      const { category, possui } = action.payload;

      if (!state.cavidade.biota) {
        state.cavidade.biota = {};
      }

      const catKey = category as keyof Biota;

      if (catKey === "peixes") {
        state.cavidade.biota.peixes = possui;
      } else if (catKey === "morcegos") {
        if (possui) {
          if (!state.cavidade.biota.morcegos) {
            state.cavidade.biota.morcegos = {
              possui: true,
              tipos: [],
              observacoes_gerais: undefined,
            };
          } else {
            state.cavidade.biota.morcegos.possui = true;
            state.cavidade.biota.morcegos.tipos =
              state.cavidade.biota.morcegos.tipos ?? []; // Garante que tipos seja um array
            state.cavidade.biota.morcegos.observacoes_gerais =
              state.cavidade.biota.morcegos.observacoes_gerais ?? undefined; // Mantém observações existentes
          }
        } else {
          if (state.cavidade.biota.morcegos) {
            state.cavidade.biota.morcegos.possui = false;
            state.cavidade.biota.morcegos.tipos = undefined; // Limpa/remove o array de tipos
            state.cavidade.biota.morcegos.observacoes_gerais = undefined; // Limpa/remove observações
          }
        }
      } else if (
        [
          "invertebrados",
          "invertebrados_aquaticos",
          "anfibios",
          "repteis",
          "aves",
        ].includes(catKey)
      ) {
        const stdCatKey = catKey as BiotaCategoryKey;
        if (possui) {
          if (!state.cavidade.biota[stdCatKey]) {
            state.cavidade.biota[stdCatKey] = {
              possui: true,
              tipos: [],
              outroEnabled: false,
              outro: undefined,
            };
          } else {
            state.cavidade.biota[stdCatKey]!.possui = true;
            state.cavidade.biota[stdCatKey]!.tipos =
              state.cavidade.biota[stdCatKey]?.tipos ?? []; // Garante que tipos seja array
            state.cavidade.biota[stdCatKey]!.outroEnabled =
              state.cavidade.biota[stdCatKey]?.outroEnabled ?? false; // Garante que outroEnabled exista (default false)
            state.cavidade.biota[stdCatKey]!.outro =
              state.cavidade.biota[stdCatKey]?.outro ?? undefined; // Garante que outro exista (default undefined)
          }
        } else {
          if (state.cavidade.biota[stdCatKey]) {
            state.cavidade.biota[stdCatKey]!.possui = false;
            state.cavidade.biota[stdCatKey]!.tipos = undefined; // Limpa/remove array de tipos
            state.cavidade.biota[stdCatKey]!.outroEnabled = false; // Reseta outroEnabled para false
            state.cavidade.biota[stdCatKey]!.outro = undefined; // Limpa/remove texto 'outro'
          }
        }
      } else {
        console.warn(
          `setBiotaPossui foi chamada com uma categoria não tratada explicitamente: ${String(
            catKey
          )}`
        );
      }
    },
    toggleBiotaOutroEnabled(
      state,
      action: PayloadAction<{ category: BiotaCategoryKey }>
    ) {
      const { category } = action.payload;
      const categoryState = state.cavidade.biota?.[category];

      if (categoryState?.possui) {
        const currentEnabled = categoryState.outroEnabled ?? false;
        const newEnabled = !currentEnabled;

        categoryState.outroEnabled = newEnabled;

        if (!newEnabled) {
          categoryState.outro = undefined;
        }
      } else {
        console.warn(
          `Cannot toggle 'outroEnabled' for category '${category}' as 'possui' is false or category doesn't exist.`
        );
      }
    },
    setBiotaCategoryOutro: (
      state,
      action: PayloadAction<{
        category: BiotaCategoryKey;
        text: string | undefined;
      }>
    ) => {
      const { category, text } = action.payload;

      if (state.cavidade.biota?.[category]?.possui) {
        state.cavidade.biota[category]!.outro = text;
      } else if (!text) {
        if (state.cavidade.biota?.[category]) {
          state.cavidade.biota[category]!.outro = undefined;
        }
      } else {
        console.warn(
          `Cannot set 'outro' text for category '${category}' as 'possui' is false or category doesn't exist.`
        );
      }
    },
    addOrUpdateMorcegoTipo: (
      state,
      action: PayloadAction<{
        tipo: BatFeedingType;
        quantidade?: BatQuantidadeType;
      }>
    ) => {
      const { tipo, quantidade } = action.payload;
      // Ensure morcegos object and tipos array exist
      if (state.cavidade.biota?.morcegos?.possui) {
        if (!state.cavidade.biota.morcegos.tipos) {
          state.cavidade.biota.morcegos.tipos = [];
        }
        const tiposArray = state.cavidade.biota.morcegos.tipos;
        const index = tiposArray.findIndex((item) => item.tipo === tipo);

        if (index > -1) {
          // Update existing item's quantity
          tiposArray[index].quantidade = quantidade!; // Non-null assertion assuming quantity is always provided on update? Adjust if needed.
        } else {
          // Add new item
          tiposArray.push({ tipo: tipo, quantidade: quantidade! }); // Add new object
        }
      } else {
        console.warn(
          `Cannot add/update morcego tipo '${tipo}' as 'morcegos.possui' is false or object doesn't exist.`
        );
      }
    },
    removeMorcegoTipo: (state, action: PayloadAction<BatFeedingType>) => {
      const tipoToRemove = action.payload;
      if (state.cavidade.biota?.morcegos?.tipos) {
        state.cavidade.biota.morcegos.tipos =
          state.cavidade.biota.morcegos.tipos.filter(
            (item) => item.tipo !== tipoToRemove
          );
      }
    },
    setMorcegosObservacoes: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      if (state.cavidade.biota?.morcegos?.possui) {
        state.cavidade.biota.morcegos.observacoes_gerais = action.payload;
      } else if (!action.payload) {
        if (state.cavidade.biota?.morcegos) {
          state.cavidade.biota.morcegos.observacoes_gerais = undefined;
        }
      } else {
        console.warn(
          `Cannot set 'observacoes_gerais' as 'morcegos.possui' is false or object doesn't exist.`
        );
      }
    },
    toggleBiotaTypeInArray: (
      state,
      action: PayloadAction<{ category: BiotaCategoryKey; type: string }>
    ) => {
      const { category, type } = action.payload;

      if (!state.cavidade.biota) {
        console.warn(
          `Cannot toggle type for category '${category}' as 'biota' object doesn't exist.`
        );
        return;
      }

      if (!state.cavidade.biota[category]) {
        console.warn(
          `Cannot toggle type for category '${category}' as category object doesn't exist.`
        );
        return;
      }

      const categoryState = state.cavidade.biota[category];

      if (categoryState?.possui) {
        if (!categoryState.tipos) {
          categoryState.tipos = [];
        }

        const currentTipos = categoryState.tipos;
        const index = currentTipos.indexOf(type);

        if (index > -1) {
          currentTipos.splice(index, 1);
        } else {
          currentTipos.push(type);
        }
      } else {
        console.warn(
          `Attempted to toggle type '${type}' for category '${category}' but its 'possui' flag is false.`
        );
      }
    },
    setArchPalPossui: (
      state,
      action: PayloadAction<{
        section: "arqueologia" | "paleontologia";
        possui: boolean;
      }>
    ) => {
      const { section, possui } = action.payload;
      if (!state.cavidade[section]) {
        state.cavidade[section] = { possui: false };
        state.cavidade[section] = { tipos: undefined };
      }
      state.cavidade[section]!.possui = possui;
      if (possui) {
        state.cavidade[section]!.tipos = state.cavidade[section]?.tipos ?? {};
        state.cavidade[section]!.tipos!.outroEnabled =
          state.cavidade[section]?.tipos?.outroEnabled ?? false;
        state.cavidade[section]!.tipos!.outro =
          state.cavidade[section]?.tipos?.outro ?? undefined;
      } else {
        if (state.cavidade[section]?.tipos) {
          state.cavidade[section]!.tipos!.outroEnabled = false;
          state.cavidade[section]!.tipos!.outro = undefined;
        }
      }
    },
    toggleArchPalTipo: (
      state,
      action: PayloadAction<{
        section: "arqueologia" | "paleontologia";
        fieldName: string;
      }>
    ) => {
      const { section, fieldName } = action.payload;
      const sectionState = state.cavidade[section];

      if (fieldName === "outroEnabled" || fieldName === "outro") {
        console.warn(
          `toggleArchPalTipo should not be used for '${fieldName}'. Use specific handlers.`
        );
        return;
      }

      if (sectionState?.possui && sectionState.tipos) {
        const tipos = sectionState.tipos as any;
        const currentVal = tipos[fieldName];
        tipos[fieldName] = !currentVal;
      } else {
        console.warn(
          `Cannot toggle tipo '<span class="math-inline">\{String\(fieldName\)\}' for section '</span>{section}' as 'possui' is false or tipos object doesn't exist.`
        );
      }
    },
    setArchPalOutro: (
      state,
      action: PayloadAction<{
        section: "arqueologia" | "paleontologia";
        text: string | undefined;
      }>
    ) => {
      const { section, text } = action.payload;
      const sectionState = state.cavidade[section];
      if (
        sectionState?.possui &&
        sectionState.tipos &&
        (sectionState.tipos.outroEnabled || !text)
      ) {
        sectionState.tipos.outro = text;
      } else if (text) {
        console.warn(
          `Cannot set 'outro' text for section '${section}' as 'outroEnabled' or 'possui' is false.`
        );
      } else if (!text && sectionState?.tipos) {
        sectionState.tipos.outro = undefined;
      }
    },
    setSedimentoPossui: (
      state,
      action: PayloadAction<{
        section: "sedimentacao_clastica" | "sedimentacao_organica";
        possui: boolean;
      }>
    ) => {
      const { section, possui } = action.payload;

      // Garante que state.cavidade.sedimentos seja inicializado se for undefined/null
      if (!state.cavidade.sedimentos) {
        state.cavidade.sedimentos = JSON.parse(JSON.stringify(initialSedimentosState));
      }
      
      // Usamos a asserção de não-nulidade (!) porque a lógica acima garante que
      // state.cavidade.sedimentos não é nulo/undefined neste ponto.
      const currentSedimentos = state.cavidade.sedimentos!; 

      const subSection = currentSedimentos[section]; 
      
      if (!subSection) {
          console.error(`Erro: subSection '${section}' não encontrada em sedimentos. Isso pode indicar uma incompatibilidade de tipo ou estado inicial.`);
          return;
      }

      subSection.possui = possui;

      if (possui) {
        subSection.tipo = subSection.tipo ?? {};
        subSection.outros = subSection.outros ?? undefined;
        subSection.outroEnabled = subSection.outroEnabled ?? false;
      } else {
        subSection.tipo = undefined; 
        subSection.outros = undefined;
        subSection.outroEnabled = false;
      }
    },
    // Novos reducers para sedimentacao_clastica
    toggleSedimentacaoClasticaOutrosEnabled: (state) => {
      if (state.cavidade.sedimentos?.sedimentacao_clastica?.possui) {
        const clastica = state.cavidade.sedimentos.sedimentacao_clastica;
        clastica.outroEnabled = !clastica.outroEnabled;
        if (!clastica.outroEnabled) {
          clastica.outros = undefined;
        }
      }
    },
    setSedimentacaoClasticaOutrosText: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      if (
        state.cavidade.sedimentos?.sedimentacao_clastica?.possui &&
        state.cavidade.sedimentos.sedimentacao_clastica.outroEnabled
      ) {
        state.cavidade.sedimentos.sedimentacao_clastica.outros = action.payload;
      } else if (
        !action.payload &&
        state.cavidade.sedimentos?.sedimentacao_clastica
      ) {
        state.cavidade.sedimentos.sedimentacao_clastica.outros = undefined;
      }
    },
    // Novos reducers para sedimentacao_organica
    toggleSedimentacaoOrganicaOutrosEnabled: (state) => {
      if (state.cavidade.sedimentos?.sedimentacao_organica?.possui) {
        const organica = state.cavidade.sedimentos.sedimentacao_organica;
        organica.outroEnabled = !organica.outroEnabled;
        if (!organica.outroEnabled) {
          organica.outros = undefined;
        }
      }
    },
    setSedimentacaoOrganicaOutrosText: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      if (
        state.cavidade.sedimentos?.sedimentacao_organica?.possui &&
        state.cavidade.sedimentos.sedimentacao_organica.outroEnabled
      ) {
        state.cavidade.sedimentos.sedimentacao_organica.outros = action.payload;
      } else if (
        !action.payload &&
        state.cavidade.sedimentos?.sedimentacao_organica
      ) {
        state.cavidade.sedimentos.sedimentacao_organica.outros = undefined;
      }
    },
    setEspeleotemasPossui: (state, action: PayloadAction<boolean>) => {
      const possui = action.payload;
      if (!state.cavidade.espeleotemas) {
        state.cavidade.espeleotemas = { possui: possui, lista: [] };
      } else {
        state.cavidade.espeleotemas.possui = possui;
        if (possui) {
          state.cavidade.espeleotemas.lista =
            state.cavidade.espeleotemas.lista ?? [];
        } else {
          state.cavidade.espeleotemas.lista = [];
        }
      }
    },
    addEspeleotemaItem: (
      state,
      action: PayloadAction<Omit<EspeleotemaItem, "id">>
    ) => {
      if (state.cavidade.espeleotemas?.possui) {
        if (!state.cavidade.espeleotemas.lista) {
          state.cavidade.espeleotemas.lista = [];
        }
        const newItem: EspeleotemaItem = {
          ...action.payload,
          id: Date.now() + Math.random(),
        };
        state.cavidade.espeleotemas.lista.push(newItem);
      } else {
        console.warn(
          "Cannot add EspeleotemaItem as 'espeleotemas.possui' is false."
        );
      }
    },
    removeEspeleotemaItem: (state, action: PayloadAction<number>) => {
      if (state.cavidade.espeleotemas?.lista) {
        const list = state.cavidade.espeleotemas.lista;
        const indexToRemove = list.findIndex(
          (item) => item.id === action.payload
        );

        if (indexToRemove !== -1) {
          list.splice(indexToRemove, 1);
        }
        if (list.length === 0) {
          state.cavidade.espeleotemas.possui = false;
        }
      }
    },
    toggleUsoCavidadeOutroEnabled(state) {
      if (!state.cavidade.aspectos_socioambientais) {
        console.warn(
          "Initializing aspectos_socioambientais in toggleUsoCavidadeOutroEnabled"
        );
        state.cavidade.aspectos_socioambientais = {
          uso_cavidade: {}, // Será populado abaixo
          area_protegida: { nao_determinado: true }, // Exemplo de valor inicial válido
          infraestrutura_acesso: { nenhuma: true }, // Exemplo de valor inicial válido
        };
      }

      if (!state.cavidade.aspectos_socioambientais.uso_cavidade) {
        state.cavidade.aspectos_socioambientais.uso_cavidade = {};
      }

      const usoCavidadeState =
        state.cavidade.aspectos_socioambientais.uso_cavidade;

      const currentEnabled = usoCavidadeState.outroEnabled ?? false;
      const newEnabled = !currentEnabled;
      usoCavidadeState.outroEnabled = newEnabled;

      if (!newEnabled) {
        usoCavidadeState.outro = undefined;
      } else {
        if (!usoCavidadeState.hasOwnProperty("outro")) {
          usoCavidadeState.outro = undefined;
        }
      }
    },
    setUsoCavidadeOutroText(state, action: PayloadAction<string | undefined>) {
      const text = action.payload;
      const usoCavidadeState =
        state.cavidade.aspectos_socioambientais?.uso_cavidade;

      if (usoCavidadeState && (usoCavidadeState.outroEnabled || !text)) {
        usoCavidadeState.outro = text;
      } else if (text && usoCavidadeState && !usoCavidadeState.outroEnabled) {
        console.warn(
          "Cannot set 'outro' text for UsoCavidade as 'outroEnabled' is false."
        );
      } else if (!usoCavidadeState && text) {
        console.warn(
          "Cannot set 'outro' text for UsoCavidade as UsoCavidade state does not exist."
        );
      } else if (!usoCavidadeState && !text) {
      }
    },
    toggleArchPalOutroEnabled(
      state,
      action: PayloadAction<{ section: "arqueologia" | "paleontologia" }>
    ) {
      const { section } = action.payload;
      const sectionState = state.cavidade[section];

      if (sectionState?.possui && sectionState.tipos) {
        const currentEnabled = sectionState.tipos.outroEnabled ?? false;
        const newEnabled = !currentEnabled;
        sectionState.tipos.outroEnabled = newEnabled;

        if (!newEnabled) {
          sectionState.tipos.outro = undefined;
        }
      } else {
        console.warn(
          `Cannot toggle 'outroEnabled' for section '${section}' as 'possui' is false or section/tipos doesn't exist.`
        );
      }
    },
    setFullInfos(state, action: PayloadAction<Cavidade>) {
      state.cavidade = action.payload;
    },
    toggleDificuldadesExternasOutroEnabled: (state) => {
      const de = state.cavidade.dificuldades_externas;
      if (de) {
        de.outroEnabled = !de.outroEnabled;
        if (!de.outroEnabled) {
          de.outro = undefined;
        }
      } else {
        console.warn(
          "toggleDificuldadesExternasOutroEnabled: state.cavidade.dificuldades_externas não encontrado."
        );
      }
    },
    setDificuldadesExternasOutroText: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      const de = state.cavidade.dificuldades_externas;
      if (de) {
        if (
          de.outroEnabled ||
          action.payload === undefined ||
          action.payload === null
        ) {
          de.outro = action.payload;
        }
      } else {
        console.warn(
          "setDificuldadesExternasOutroText: state.cavidade.dificuldades_externas não encontrado."
        );
      }
    },
    toggleInfraestruturaInternaOutrosEnabled: (state) => {
      const ii = state.cavidade.caracterizacao_interna?.infraestrutura_interna;
      if (ii) {
        ii.outroEnabled = !ii.outroEnabled;
        if (!ii.outroEnabled) {
          ii.outros = undefined;
        }
      } else {
        console.warn(
          "toggleInfraestruturaInternaOutrosEnabled: infraestrutura_interna não encontrada."
        );
      }
    },
    setInfraestruturaInternaOutrosText: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      const ii = state.cavidade.caracterizacao_interna?.infraestrutura_interna;
      if (ii) {
        if (
          ii.outroEnabled ||
          action.payload === undefined ||
          action.payload === null
        ) {
          ii.outros = action.payload;
        }
      } else {
        console.warn(
          "setInfraestruturaInternaOutrosText: infraestrutura_interna não encontrada."
        );
      }
    },
  },
});

export const {
  updateCurrentStep,
  updateCavidadeData,
  resetCavidadeState,
  setLoading,
  setError,
  addEntrada,
  removeEntrada,
  setEntradaPrincipal,
  addOrUpdateMorcegoTipo,
  removeMorcegoTipo,
  setBiotaCategoryOutro,
  setBiotaPossui,
  setMorcegosObservacoes,
  toggleBiotaTypeInArray,
  setArchPalOutro,
  setArchPalPossui,
  toggleArchPalTipo,
  setSedimentoPossui,
  addEspeleotemaItem,
  removeEspeleotemaItem,
  setEspeleotemasPossui,
  toggleBiotaOutroEnabled,
  toggleUsoCavidadeOutroEnabled,
  setUsoCavidadeOutroText,
  toggleArchPalOutroEnabled,
  setFullInfos,
  setDificuldadesExternasOutroText,
  setInfraestruturaInternaOutrosText,
  toggleDificuldadesExternasOutroEnabled,
  toggleInfraestruturaInternaOutrosEnabled,
  setSedimentacaoClasticaOutrosText,
  setSedimentacaoOrganicaOutrosText,
  toggleSedimentacaoClasticaOutrosEnabled,
  toggleSedimentacaoOrganicaOutrosEnabled,
} = cavitySlice.actions;

export default cavitySlice.reducer;
