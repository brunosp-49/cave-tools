import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Cavidade } from "../types"; // Certifique-se que o tipo Cavidade existe e está correto

// Define a forma do objeto de filtros
interface DashboardFilters {
  projetoId: string | null;
  nomeCavidade: string;
  codigoCavidade: string;
  municipio: string;
}

// Define a forma do estado completo deste slice
interface DashboardState {
  filters: DashboardFilters;
  filteredCavities: Cavidade[];
  isLoading: boolean;
}

const initialState: DashboardState = {
  filters: {
    projetoId: null,
    nomeCavidade: "",
    codigoCavidade: "",
    municipio: "",
  },
  filteredCavities: [],
  isLoading: false,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    // Action para atualizar um ou mais filtros
    setDashboardFilters(
      state,
      action: PayloadAction<Partial<DashboardFilters>>
    ) {
      state.filters = { ...state.filters, ...action.payload };
    },
    // Action para armazenar o resultado da busca de cavidades
    setFilteredCavities(state, action: PayloadAction<Cavidade[]>) {
      state.filteredCavities = action.payload;
    },
    // Action para controlar o estado de carregamento
    setDashboardLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    // Action para limpar os filtros e resultados
    resetDashboardState(state) {
      state.filters = initialState.filters;
      state.filteredCavities = initialState.filteredCavities;
    },
  },
});

export const {
  setDashboardFilters,
  setFilteredCavities,
  setDashboardLoading,
  resetDashboardState,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
