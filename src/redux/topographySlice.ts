import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TopographyPoint } from '../types';

// Definindo e exportando o tipo para os modos
export type TopographyMode = 'create' | 'edit' | 'view' | null;

// A estrutura do filtro usada no StepOne
export interface ProjectFilter {
  project: { id: string; value: string } | null;
  cavity_name: string;
  cavity_id: string;
  state: string;
  city: string;
}

// A estrutura completa do estado para este slice
export interface TopographyState {
  mode: TopographyMode;
  currentStep: number;
  projectFilter: ProjectFilter;
  cavity_id: string | null;
  topography: TopographyPoint[]; // Array de pontos para a função de salvar antiga
}

const initialState: TopographyState = {
  mode: null,
  currentStep: 0,
  projectFilter: {
    project: null,
    cavity_name: '',
    cavity_id: '',
    state: '',
    city: '',
  },
  cavity_id: null,
  topography: [],
};

const topographySlice = createSlice({
  name: 'topography',
  initialState,
  reducers: {
    updateMode(state, action: PayloadAction<TopographyMode>) {
      state.mode = action.payload;
    },
    updateCurrentStep(state, action: PayloadAction<number>) {
      state.currentStep = action.payload;
    },
    updateProjectFilter(state, action: PayloadAction<Partial<ProjectFilter>>) {
      state.projectFilter = { ...state.projectFilter, ...action.payload };
    },
    updateCavityId(state, action: PayloadAction<string | null>) {
      state.cavity_id = action.payload;
    },
    updateTopography(state, action: PayloadAction<TopographyPoint[]>) {
      state.topography = action.payload;
    },
    resetTopographyState() {
      return initialState;
    },
  },
});

export const {
  updateMode,
  updateCurrentStep,
  updateProjectFilter,
  updateCavityId,
  updateTopography,
  resetTopographyState,
} = topographySlice.actions;

export default topographySlice.reducer;