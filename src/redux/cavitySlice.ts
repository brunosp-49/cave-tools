import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Arqueologia,
  BatFeedingType,
  BatQuantidadeType,
  Biota,
  BiotaStandardCategoryKey,
  BiotaCustomObjectCategoryKey,
  Cavidade,
  Entrada,
  EspeleotemaItem,
  Paleontologia,
  Invertebrado,
  InvertebradoAquatico,
  Area_protegida,
  Uso_cavidade,
  Infraestrutura_acesso,
  AspectosSocioambientais,
  CaracterizacaoInterna,
  Infraestrutura_interna,
  Dificuldades_externas,
  Dificuldades_progressao_interna,
  Grupo_litologico,
  Sedimentos,
} from "../types";
import { formatDateToInput } from "../util";

// --- Initial State Definitions for Sub-structures ---
const initialSedimentosState: NonNullable<Cavidade['sedimentos']> = {
  sedimentacao_clastica: {
    possui: false,
    tipo: {},
    outros: undefined,
    outroEnabled: false,
  },
  sedimentacao_organica: {
    possui: false,
    tipo: {},
    outros: undefined,
    outroEnabled: false,
  },
};

const initialInvertebradoState: Invertebrado = {
    possui: false,
    aranha: false, acaro: false, amblipigio: false, opiliao: false,
    pseudo_escorpiao: false, escorpiao: false, formiga: false, besouro: false,
    mosca: false, mosquito: false, mariposa: false, barata: false, cupim: false,
    grilo: false, percevejo: false, piolho_de_cobra: false, centopeia: false,
    lacraia: false, caramujo_terrestre: false, tatuzinho_de_jardim: false,
    outroEnabled: false, outro: undefined,
};

const initialInvertebradoAquaticoState: InvertebradoAquatico = {
    possui: false,
    caramujo_aquatico: false, bivalve: false, camarao: false, caranguejo: false,
    outroEnabled: false, outro: undefined,
};

const initialUsoCavidadeState: Uso_cavidade = {
    religioso: false, cientifico_cultural: false, social: false, minerario: false,
    pedagogico: false, esportivo: false, turistico: false, incipiente: false,
    massa: false, aventura: false, mergulho: false, rapel: false,
    outroEnabled: false, outro: undefined,
};

const initialAreaProtegidaState: Area_protegida = {
    nao_determinado: true,
    federal: undefined, estadual: undefined, municipal: undefined,
};

const initialInfraestruturaAcessoState: Infraestrutura_acesso = {
    nenhuma: true,
    receptivo: false, condutor_para_visitantes: false,
    lanchonete_ou_restaurante: false, pousada_ou_hotel: false,
};

const initialAspectosSocioambientaisState: NonNullable<Cavidade['aspectos_socioambientais']> = {
    uso_cavidade: JSON.parse(JSON.stringify(initialUsoCavidadeState)),
    comunidade_envolvida: { envolvida: false, descricao: undefined },
    area_protegida: JSON.parse(JSON.stringify(initialAreaProtegidaState)),
    infraestrutura_acesso: JSON.parse(JSON.stringify(initialInfraestruturaAcessoState)),
};

const initialInfraestruturaInternaState: NonNullable<CaracterizacaoInterna['infraestrutura_interna']> = {
    nenhuma: true, passarela: false, portao: false, escada: false, corda: false,
    iluminacao_artificial: false, ponto_ancoragem: false,
    corrimao: undefined,
    outroEnabled: false, outros: undefined,
};

const initialDificuldadesProgressaoInternaState: NonNullable<CaracterizacaoInterna['dificuldades_progressao_interna']> = {
    nenhuma: true, teto_baixo: false, blocos_instaveis: false, trechos_escorregadios: false,
    rastejamento: false, natacao: false, lances_verticais: false, passagem_curso_agua: false,
    quebra_corpo: false, sifao: false, cachoeira: false,
    outro: undefined
};

const initialGrupoLitologicoState: NonNullable<CaracterizacaoInterna['grupo_litologico']> = {
    rochas_carbonaticas: false, rochas_ferriferas_ferruginosas: false, rochas_siliciclasticas: false,
    rochas_peliticas: false, rochas_granito_gnaissicas: false, outro: undefined,
};

const initialCaracterizacaoInternaState: NonNullable<Cavidade['caracterizacao_interna']> = {
    grupo_litologico: JSON.parse(JSON.stringify(initialGrupoLitologicoState)),
    desenvolvimento_predominante: undefined,
    depredacao_localizada: false,
    descricao_depredacao_localizada: undefined,
    depredacao_intensa: false,
    descricao_depredacao_intensa: undefined,
    infraestrutura_interna: JSON.parse(JSON.stringify(initialInfraestruturaInternaState)),
    dificuldades_progressao_interna: JSON.parse(JSON.stringify(initialDificuldadesProgressaoInternaState)),
};

const initialDificuldadesExternasState: NonNullable<Cavidade['dificuldades_externas']> = {
    nenhuma: true, rastejamento: false, quebra_corpo: false, teto_baixo: false, natacao: false,
    sifao: false, blocos_instaveis: false, lances_verticais: false, cachoeira: false,
    trechos_escorregadios: false, passagem_curso_agua: false,
    outroEnabled: false, outro: undefined,
};

const initialBiotaState: NonNullable<Cavidade['biota']> = { // DEFINED HERE
    invertebrado: JSON.parse(JSON.stringify(initialInvertebradoState)),
    invertebrado_aquatico: JSON.parse(JSON.stringify(initialInvertebradoAquaticoState)),
    anfibios: { possui: false, tipos: [], outroEnabled: false, outro: undefined },
    repteis: { possui: false, tipos: [], outroEnabled: false, outro: undefined },
    aves: { possui: false, tipos: [], outroEnabled: false, outro: undefined },
    peixes: false,
    morcegos: { possui: false, tipos: [], observacoes_gerais: undefined }
};

const initialArqueologiaState: NonNullable<Cavidade['arqueologia']> = {
    possui: false, tipos: { outroEnabled: false, outro: undefined }
};
const initialPaleontologiaState: NonNullable<Cavidade['paleontologia']> = {
    possui: false, tipos: { outroEnabled: false, outro: undefined }
};
const initialEspeleotemasState: NonNullable<Cavidade['espeleotemas']> = {
    possui: false, tipos: []
};

// --- Main Initial State for the Slice ---
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
  dificuldades_externas: JSON.parse(JSON.stringify(initialDificuldadesExternasState)),
  aspectos_socioambientais: JSON.parse(JSON.stringify(initialAspectosSocioambientaisState)),
  caracterizacao_interna: JSON.parse(JSON.stringify(initialCaracterizacaoInternaState)),
  topografia: undefined,
  morfologia: undefined,
  hidrologia: undefined,
  sedimentos: JSON.parse(JSON.stringify(initialSedimentosState)),
  espeleotemas: JSON.parse(JSON.stringify(initialEspeleotemasState)),
  biota: JSON.parse(JSON.stringify(initialBiotaState)), // Uses the above constant
  arqueologia: JSON.parse(JSON.stringify(initialArqueologiaState)),
  paleontologia: JSON.parse(JSON.stringify(initialPaleontologiaState)),
};

interface CavitySliceState {
  currentStep: number;
  cavidade: Cavidade;
  isLoading: boolean;
  error: string | null;
}

const initialState: CavitySliceState = {
  currentStep: 0,
  cavidade: JSON.parse(JSON.stringify(initialCavidadeState)),
  isLoading: false,
  error: null,
};

interface UpdateDataPayload {
  path: (string | number)[];
  value: any;
}

const createDefaultBiotaObjectState = (category: BiotaCustomObjectCategoryKey) => {
    if (category === 'invertebrado') return JSON.parse(JSON.stringify(initialInvertebradoState));
    if (category === 'invertebrado_aquatico') return JSON.parse(JSON.stringify(initialInvertebradoAquaticoState));
    return { possui: true, outroEnabled: false, outro: undefined }; // Fallback
};

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
          const nextKey = path[i + 1];
          if (current[key] === undefined || current[key] === null) {
            let initialSubState: any;
            if (path[0] === 'biota' && i === 0 ) {
                if (key === 'invertebrado' || key === 'invertebrado_aquatico') { current[key] = createDefaultBiotaObjectState(key as BiotaCustomObjectCategoryKey); initialSubState = 'HANDLED'; } // Mark as handled
                else { initialSubState = (initialBiotaState as any)?.[key]; }
            } else if (path[0] === 'aspectos_socioambientais' && i === 0) {
                 initialSubState = (initialAspectosSocioambientaisState as any)?.[key];
            } else if (path[0] === 'caracterizacao_interna' && i === 0) {
                 initialSubState = (initialCaracterizacaoInternaState as any)?.[key];
            } else if (path[0] === 'sedimentos' && i === 0) {
                 initialSubState = (initialSedimentosState as any)?.[key];
            }

            if (initialSubState && initialSubState !== 'HANDLED') {
                current[key] = JSON.parse(JSON.stringify(initialSubState));
            } else if (initialSubState !== 'HANDLED' && !current[key]) {
                 current[key] = typeof nextKey === "number" ? [] : {};
            }
          }
          current = current[key];
        }

        if (path.length > 0) {
          const finalKey = path[path.length - 1];
          if (current !== undefined && current !== null) {
            current[finalKey] = value;
          } else {
            state.error = `Error: Parent path not fully initialized for ${path.join(".")}`;
          }
        } else { state.error = "Error: Received empty path."; }
      } catch (error: any) {
        state.error = error.message || `Failed to update field at path: ${path.join(".")}`;
      }
    },
    resetCavidadeState: () => JSON.parse(JSON.stringify(initialState)),
    setLoading: (state, action: PayloadAction<boolean>) => { state.isLoading = action.payload; },
    setError: (state, action: PayloadAction<string | null>) => { state.error = action.payload; },
    addEntrada: (state, action: PayloadAction<Entrada>) => {
      if(!state.cavidade.entradas) state.cavidade.entradas = [];
      const isFirstEntry = state.cavidade.entradas.length === 0;
      state.cavidade.entradas.push({ ...action.payload, principal: isFirstEntry });
    },
    removeEntrada: (state, action: PayloadAction<number>) => {
      const indexToRemove = action.payload;
      if (!state.cavidade.entradas || indexToRemove < 0 || indexToRemove >= state.cavidade.entradas.length) {
        state.error = `Invalid index ${indexToRemove} for removing entrada.`; return;
      }
      const wasPrincipal = state.cavidade.entradas[indexToRemove].principal;
      state.cavidade.entradas.splice(indexToRemove, 1);
      if (wasPrincipal && state.cavidade.entradas.length > 0 && !state.cavidade.entradas.some(e => e.principal)) {
        state.cavidade.entradas[0].principal = true;
      }
    },
    setEntradaPrincipal: (state, action: PayloadAction<number>) => {
      const indexToSet = action.payload;
       if (!state.cavidade.entradas || indexToSet < 0 || indexToSet >= state.cavidade.entradas.length) {
        state.error = `Invalid index ${indexToSet} for setting principal entrada.`; return;
      }
      state.cavidade.entradas.forEach((entry, index) => { entry.principal = index === indexToSet; });
    },
    setBiotaPossui: ( state, action: PayloadAction<{ category: keyof Biota; possui: boolean }>) => {
      const { category, possui } = action.payload;
      if (!state.cavidade.biota) state.cavidade.biota = JSON.parse(JSON.stringify(initialBiotaState));
      const currentBiota = state.cavidade.biota!;

      if (category === "peixes") currentBiota.peixes = possui;
      else if (category === "morcegos") {
        if (!currentBiota.morcegos) currentBiota.morcegos = JSON.parse(JSON.stringify(initialBiotaState.morcegos));
        currentBiota.morcegos!.possui = possui;
        if (possui) {
            currentBiota.morcegos!.tipos = currentBiota.morcegos!.tipos ?? [];
            currentBiota.morcegos!.observacoes_gerais = currentBiota.morcegos!.observacoes_gerais ?? undefined;
        }
      } else if (category === "invertebrado" || category === "invertebrado_aquatico") {
        const catKey = category as BiotaCustomObjectCategoryKey;
        if (!currentBiota[catKey]) currentBiota[catKey] = createDefaultBiotaObjectState(catKey) as any;
        (currentBiota[catKey] as Invertebrado | InvertebradoAquatico).possui = possui;
      } else if (["anfibios", "repteis", "aves"].includes(category)) {
        const stdCatKey = category as BiotaStandardCategoryKey;
        if (!currentBiota[stdCatKey]) currentBiota[stdCatKey] = JSON.parse(JSON.stringify(initialBiotaState[stdCatKey]));
        currentBiota[stdCatKey]!.possui = possui;
        if (possui) {
            currentBiota[stdCatKey]!.tipos = currentBiota[stdCatKey]?.tipos ?? [];
            currentBiota[stdCatKey]!.outroEnabled = currentBiota[stdCatKey]?.outroEnabled ?? false;
            currentBiota[stdCatKey]!.outro = currentBiota[stdCatKey]?.outro ?? undefined;
        }
      }
    },
    toggleBiotaTypeInArray: ( state, action: PayloadAction<{ category: BiotaStandardCategoryKey; type: string }>) => {
      const { category, type } = action.payload;
      if (!state.cavidade.biota?.[category]) {
          if(!state.cavidade.biota) state.cavidade.biota = JSON.parse(JSON.stringify(initialBiotaState));
          (state.cavidade.biota![category] as any) = JSON.parse(JSON.stringify(initialBiotaState[category]));
      }
      const categoryState = state.cavidade.biota![category]!;
      if (categoryState.possui) {
        if (!categoryState.tipos) categoryState.tipos = [];
        const index = categoryState.tipos.indexOf(type);
        if (index > -1) categoryState.tipos.splice(index, 1);
        else categoryState.tipos.push(type);
      }
    },
    toggleBiotaObjectTypeFlag: ( state, action: PayloadAction<{ category: BiotaCustomObjectCategoryKey; typeKey: string }>) => {
      const { category, typeKey } = action.payload;
      if (!state.cavidade.biota?.[category]) {
          if(!state.cavidade.biota) state.cavidade.biota = JSON.parse(JSON.stringify(initialBiotaState));
          (state.cavidade.biota![category] as any) = createDefaultBiotaObjectState(category);
      }
      const categoryState = state.cavidade.biota![category] as any;
      if (categoryState.possui) categoryState[typeKey] = !categoryState[typeKey];
    },
    toggleBiotaOutroEnabled(state, action: PayloadAction<{ category: BiotaStandardCategoryKey | BiotaCustomObjectCategoryKey }>) {
      const { category } = action.payload;
      if (!state.cavidade.biota?.[category]) {
          if(!state.cavidade.biota) state.cavidade.biota = JSON.parse(JSON.stringify(initialBiotaState));
          (state.cavidade.biota![category] as any) = category === "invertebrado" || category === "invertebrado_aquatico" ?
            createDefaultBiotaObjectState(category) :
            JSON.parse(JSON.stringify(initialBiotaState[category]));
      }
      const categoryState = state.cavidade.biota![category] as any;
      if (categoryState.possui) {
        categoryState.outroEnabled = !(categoryState.outroEnabled ?? false);
        if (!categoryState.outroEnabled) categoryState.outro = undefined;
      }
    },
    setBiotaCategoryOutro: ( state, action: PayloadAction<{ category: BiotaStandardCategoryKey | BiotaCustomObjectCategoryKey; text: string | undefined; }>) => {
      const { category, text } = action.payload;
       if (!state.cavidade.biota?.[category]) {
          if(!state.cavidade.biota) state.cavidade.biota = JSON.parse(JSON.stringify(initialBiotaState));
          (state.cavidade.biota![category] as any) = category === "invertebrado" || category === "invertebrado_aquatico" ?
            createDefaultBiotaObjectState(category) :
            JSON.parse(JSON.stringify(initialBiotaState[category]));
      }
      const categoryState = state.cavidade.biota![category] as any;
      if (categoryState) {
          if (categoryState.possui && categoryState.outroEnabled) categoryState.outro = text;
          else if (!text) categoryState.outro = undefined;
      }
    },
    addOrUpdateMorcegoTipo: ( state, action: PayloadAction<{ tipo: BatFeedingType; quantidade?: BatQuantidadeType; }>) => {
      if (!state.cavidade.biota) state.cavidade.biota = JSON.parse(JSON.stringify(initialBiotaState));
      if (!state.cavidade.biota!.morcegos) state.cavidade.biota!.morcegos = JSON.parse(JSON.stringify(initialBiotaState.morcegos));

      const morcegosState = state.cavidade.biota!.morcegos!;

      if (morcegosState.possui) {
        if (!morcegosState.tipos) morcegosState.tipos = [];
        const tiposArray = morcegosState.tipos;
        const { tipo, quantidade } = action.payload;
        const index = tiposArray.findIndex(item => item.tipo === tipo);

        if (index > -1) {
          if (quantidade !== undefined) tiposArray[index].quantidade = quantidade;
        } else {
          const defaultQuantity: BatQuantidadeType = "individuo";
          tiposArray.push({
            tipo: tipo,
            quantidade: quantidade === undefined ? defaultQuantity : quantidade
          });
        }
      }
    },
    removeMorcegoTipo: (state, action: PayloadAction<BatFeedingType>) => {
      if (state.cavidade.biota?.morcegos?.tipos) {
        state.cavidade.biota.morcegos.tipos = state.cavidade.biota.morcegos.tipos.filter(item => item.tipo !== action.payload);
      }
    },
    setMorcegosObservacoes: (state, action: PayloadAction<string | undefined>) => {
      if (!state.cavidade.biota) state.cavidade.biota = JSON.parse(JSON.stringify(initialBiotaState));
      if (!state.cavidade.biota!.morcegos) state.cavidade.biota!.morcegos = JSON.parse(JSON.stringify(initialBiotaState.morcegos));
      state.cavidade.biota!.morcegos!.observacoes_gerais = action.payload;
    },
    setArchPalPossui: (state, action: PayloadAction<{ section: "arqueologia" | "paleontologia"; possui: boolean; }>) => {
      const { section, possui } = action.payload;
      if (!state.cavidade[section]) state.cavidade[section] = JSON.parse(JSON.stringify(initialCavidadeState[section]));
      state.cavidade[section]!.possui = possui;
      if (possui) state.cavidade[section]!.tipos = state.cavidade[section]?.tipos ?? { outroEnabled: false, outro: undefined };
    },
    toggleArchPalTipo: (state, action: PayloadAction<{ section: "arqueologia" | "paleontologia"; fieldName: string; }>) => {
      const { section, fieldName } = action.payload;
      if (fieldName === "outroEnabled" || fieldName === "outro") { return; }
      if (!state.cavidade[section]) state.cavidade[section] = JSON.parse(JSON.stringify(initialCavidadeState[section]));
      const sectionState = state.cavidade[section]!;
      if (sectionState.possui && sectionState.tipos) (sectionState.tipos as any)[fieldName] = !(sectionState.tipos as any)[fieldName];
    },
    toggleArchPalOutroEnabled(state, action: PayloadAction<{ section: "arqueologia" | "paleontologia" }>) {
      const { section } = action.payload;
      if (!state.cavidade[section]) state.cavidade[section] = JSON.parse(JSON.stringify(initialCavidadeState[section]));
      const sectionState = state.cavidade[section]!;
      if (sectionState.possui && sectionState.tipos) {
        sectionState.tipos.outroEnabled = !(sectionState.tipos.outroEnabled ?? false);
        if (!sectionState.tipos.outroEnabled) sectionState.tipos.outro = undefined;
      }
    },
    setArchPalOutro: (state, action: PayloadAction<{ section: "arqueologia" | "paleontologia"; text: string | undefined; }>) => {
      const { section, text } = action.payload;
      if (!state.cavidade[section]) state.cavidade[section] = JSON.parse(JSON.stringify(initialCavidadeState[section]));
      const sectionState = state.cavidade[section]!;
      if (sectionState.possui && sectionState.tipos) {
          if (sectionState.tipos.outroEnabled) sectionState.tipos.outro = text;
          else if (!text) sectionState.tipos.outro = undefined;
      }
    },
    setSedimentoPossui: ( state, action: PayloadAction<{ section: "sedimentacao_clastica" | "sedimentacao_organica"; possui: boolean; }>) => {
      const { section, possui } = action.payload;
      if (!state.cavidade.sedimentos) state.cavidade.sedimentos = JSON.parse(JSON.stringify(initialSedimentosState));
      const subSection = state.cavidade.sedimentos![section];
      if (!subSection) return;
      subSection.possui = possui;
      if (possui) {
        subSection.tipo = subSection.tipo ?? {};
        subSection.outros = subSection.outros ?? undefined;
        subSection.outroEnabled = subSection.outroEnabled ?? false;
      }
    },
    toggleSedimentacaoClasticaOutrosEnabled: (state) => {
      if (!state.cavidade.sedimentos) state.cavidade.sedimentos = JSON.parse(JSON.stringify(initialSedimentosState));
      const clastica = state.cavidade.sedimentos!.sedimentacao_clastica;
      if (clastica?.possui) {
        clastica.outroEnabled = !clastica.outroEnabled;
        if (!clastica.outroEnabled) clastica.outros = undefined;
      }
    },
    setSedimentacaoClasticaOutrosText: (state, action: PayloadAction<string | undefined>) => {
      if (!state.cavidade.sedimentos) state.cavidade.sedimentos = JSON.parse(JSON.stringify(initialSedimentosState));
      const clastica = state.cavidade.sedimentos!.sedimentacao_clastica;
      if (clastica?.possui) {
        if (clastica.outroEnabled) clastica.outros = action.payload;
        else if (!action.payload) clastica.outros = undefined;
      }
    },
    toggleSedimentacaoOrganicaOutrosEnabled: (state) => {
      if (!state.cavidade.sedimentos) state.cavidade.sedimentos = JSON.parse(JSON.stringify(initialSedimentosState));
      const organica = state.cavidade.sedimentos!.sedimentacao_organica;
      if (organica?.possui) {
        organica.outroEnabled = !organica.outroEnabled;
        if (!organica.outroEnabled) organica.outros = undefined;
      }
    },
    setSedimentacaoOrganicaOutrosText: (state, action: PayloadAction<string | undefined>) => {
      if (!state.cavidade.sedimentos) state.cavidade.sedimentos = JSON.parse(JSON.stringify(initialSedimentosState));
      const organica = state.cavidade.sedimentos!.sedimentacao_organica;
      if (organica?.possui) {
        if (organica.outroEnabled) organica.outros = action.payload;
        else if (!action.payload) organica.outros = undefined;
      }
    },
    setEspeleotemasPossui: (state, action: PayloadAction<boolean>) => {
      const possui = action.payload;
      if (!state.cavidade.espeleotemas) state.cavidade.espeleotemas = { possui: possui, tipos: [] };
      else {
        state.cavidade.espeleotemas.possui = possui;
        if (possui) state.cavidade.espeleotemas.tipos = state.cavidade.espeleotemas.tipos ?? [];
        else state.cavidade.espeleotemas.tipos = [];
      }
    },
    addEspeleotemaItem: (state, action: PayloadAction<Omit<EspeleotemaItem, "id">>) => {
      if (!state.cavidade.espeleotemas) state.cavidade.espeleotemas = { possui: true, tipos: [] };
      else state.cavidade.espeleotemas.possui = true;

      if (!state.cavidade.espeleotemas.tipos) state.cavidade.espeleotemas.tipos = [];
      state.cavidade.espeleotemas.tipos.push({ ...action.payload, id: Date.now() + Math.random() });
    },
    removeEspeleotemaItem: (state, action: PayloadAction<number>) => {
      if (state.cavidade.espeleotemas?.tipos) {
        const list = state.cavidade.espeleotemas.tipos;
        const indexToRemove = list.findIndex(item => item.id === action.payload);
        if (indexToRemove !== -1) list.splice(indexToRemove, 1);
      }
    },
    toggleUsoCavidadeOutroEnabled(state) {
      if (!state.cavidade.aspectos_socioambientais) {
        state.cavidade.aspectos_socioambientais = JSON.parse(JSON.stringify(initialAspectosSocioambientaisState));
      }
      const aspectos = state.cavidade.aspectos_socioambientais!;

      if (!aspectos.uso_cavidade) {
        aspectos.uso_cavidade = JSON.parse(JSON.stringify(initialUsoCavidadeState));
      }
      const usoCavidade = aspectos.uso_cavidade;

      usoCavidade.outroEnabled = !(usoCavidade.outroEnabled ?? false);
      if (!usoCavidade.outroEnabled) {
        usoCavidade.outro = undefined;
      } else if (usoCavidade.outro === undefined) {
        usoCavidade.outro = undefined;
      }
    },
    setUsoCavidadeOutroText(state, action: PayloadAction<string | undefined>) {
      const text = action.payload;
      if (!state.cavidade.aspectos_socioambientais) {
         state.cavidade.aspectos_socioambientais = JSON.parse(JSON.stringify(initialAspectosSocioambientaisState));
      }
      const aspectos = state.cavidade.aspectos_socioambientais!;

      if (!aspectos.uso_cavidade) {
         aspectos.uso_cavidade = JSON.parse(JSON.stringify(initialUsoCavidadeState));
      }
      const usoCavidade = aspectos.uso_cavidade;

      if (usoCavidade.outroEnabled) {
          usoCavidade.outro = text;
      } else if (!text) {
          usoCavidade.outro = undefined;
      }
    },
    toggleInfraestruturaInternaOutrosEnabled: (state) => {
      if (!state.cavidade.caracterizacao_interna) {
        state.cavidade.caracterizacao_interna = JSON.parse(JSON.stringify(initialCaracterizacaoInternaState));
      }
      const ci = state.cavidade.caracterizacao_interna!;

      if (!ci.infraestrutura_interna) {
        ci.infraestrutura_interna = JSON.parse(JSON.stringify(initialInfraestruturaInternaState));
      }
      const ii = ci.infraestrutura_interna!;

      ii.outroEnabled = !(ii.outroEnabled ?? false);
      if (!ii.outroEnabled) {
        ii.outros = undefined;
      }
    },
    setInfraestruturaInternaOutrosText: (state, action: PayloadAction<string | undefined>) => {
      if (!state.cavidade.caracterizacao_interna) {
        state.cavidade.caracterizacao_interna = JSON.parse(JSON.stringify(initialCaracterizacaoInternaState));
      }
      const ci = state.cavidade.caracterizacao_interna!;

      if (!ci.infraestrutura_interna) {
        ci.infraestrutura_interna = JSON.parse(JSON.stringify(initialInfraestruturaInternaState));
      }
      const ii = ci.infraestrutura_interna!;

      if (ii.outroEnabled) {
        ii.outros = action.payload;
      } else if (!action.payload) {
        ii.outros = undefined;
      }
    },
    setFullInfos(state, action: PayloadAction<Cavidade>) {
      const newCavidade = JSON.parse(JSON.stringify(action.payload));

      const mergeDeep = (target: any, source: any, defaultSource: any) => {
        target = target ?? (typeof defaultSource === 'object' && defaultSource !== null ? JSON.parse(JSON.stringify(defaultSource)) : defaultSource);
        if (typeof defaultSource === 'object' && defaultSource !== null) {
            for (const key in defaultSource) {
                if (source?.[key] === undefined && target[key] === undefined) { // If payload doesn't have the key, and target doesn't (use default)
                    target[key] = JSON.parse(JSON.stringify(defaultSource[key]));
                } else if (source?.[key] !== undefined && typeof source[key] === 'object' && source[key] !== null && !(Array.isArray(source[key])) && defaultSource[key] !== undefined) {
                    if (!target[key] || typeof target[key] !== 'object') target[key] = {};
                     mergeDeep(target[key], source[key], defaultSource[key] || {});
                } else if (source?.[key] !== undefined) { // Primitive, array, or null from source
                    target[key] = source[key];
                } else { // Source doesn't have key, target might already have it from initial spread
                    // Do nothing, target already has its value (or default if target was initially empty)
                }
            }
        }
        if (typeof source === 'object' && source !== null) {
            for (const key in source) {
                if (target?.[key] === undefined) { // Add keys from source not in default, if target also doesn't have it
                    target[key] = source[key];
                }
            }
        }
        return target;
      };

      state.cavidade = mergeDeep({}, newCavidade, initialCavidadeState);
    },
    toggleDificuldadesExternasOutroEnabled: (state) => {
      if (!state.cavidade.dificuldades_externas) state.cavidade.dificuldades_externas = JSON.parse(JSON.stringify(initialDificuldadesExternasState));
      const de = state.cavidade.dificuldades_externas!;
      de.outroEnabled = !(de.outroEnabled ?? false);
      if (!de.outroEnabled) de.outro = undefined;
    },
    setDificuldadesExternasOutroText: (state, action: PayloadAction<string | undefined>) => {
      if (!state.cavidade.dificuldades_externas) state.cavidade.dificuldades_externas = JSON.parse(JSON.stringify(initialDificuldadesExternasState));
      const de = state.cavidade.dificuldades_externas!;
      if (de.outroEnabled) de.outro = action.payload;
      else if (!action.payload) de.outro = undefined;
    },
  },
});

export const {
  updateCurrentStep, updateCavidadeData, resetCavidadeState, setLoading, setError,
  addEntrada, removeEntrada, setEntradaPrincipal,
  addOrUpdateMorcegoTipo, removeMorcegoTipo, setBiotaCategoryOutro, setBiotaPossui,
  setMorcegosObservacoes, toggleBiotaTypeInArray, toggleBiotaObjectTypeFlag,
  setArchPalOutro, setArchPalPossui, toggleArchPalTipo, setSedimentoPossui,
  addEspeleotemaItem, removeEspeleotemaItem, setEspeleotemasPossui,
  toggleBiotaOutroEnabled, toggleUsoCavidadeOutroEnabled, setUsoCavidadeOutroText,
  toggleArchPalOutroEnabled, setFullInfos, setDificuldadesExternasOutroText,
  setInfraestruturaInternaOutrosText, toggleDificuldadesExternasOutroEnabled,
  toggleInfraestruturaInternaOutrosEnabled, setSedimentacaoClasticaOutrosText,
  setSedimentacaoOrganicaOutrosText, toggleSedimentacaoClasticaOutrosEnabled,
  toggleSedimentacaoOrganicaOutrosEnabled,
} = cavitySlice.actions;

export default cavitySlice.reducer;