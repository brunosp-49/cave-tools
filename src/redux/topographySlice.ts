import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { TopographyPoint } from "../types";

interface SelectOption {
  id: string;
  value: string;
}

interface TopographyState {
  currentStep: number;
  topography: TopographyPoint[];
  projectFilter: {
    project: SelectOption;
    cavity_name: string;
    cavity_id: string;
    state: string;
    city: string;
  },
  cavity_id: string;
  isLoading: boolean;
  error: string | null;
  mode: string;
}

interface UpdateDataPayload {
  path: (string | number)[];
  value: any;
}

export type ProjectFilter = {
  project: SelectOption;
  cavity_name: string;
  cavity_id: string;
  state: string;
  city: string;
}

const projectFilterInitialState: ProjectFilter = {
  project: {
    id: '',
    value: ''
  },
  cavity_name: '',
  cavity_id: '',
  state: '',
  city: ''
}

const topographyInitialState: TopographyPoint[] = [
  {
    cavity_id: '',
    azimuth: 0,
    distance: 0,
    from: 0,
    incline: 0,
    to: 0,
    turnDown: 0,
    turnLeft: 0,
    turnRight: 0,
    turnUp: 0
  }
]

const initialState: TopographyState = {
  currentStep: 0,
  topography: topographyInitialState,
  projectFilter: projectFilterInitialState,
  cavity_id: '',
  isLoading: false,
  error: null,
  mode: 'create',
}

const topographySlice = createSlice({
  name: 'topography',
  initialState,
  reducers: {
    updateMode: (state, action: PayloadAction<string>) => {
      state.mode = action.payload;
    },
    resetMode: (state) => {
      state.mode = 'create';
    },
    updateCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    updateCavity: (state, action: PayloadAction<ProjectFilter>) => {
      state.projectFilter = action.payload;
    },
    resetTopographyState: () => {
      return initialState;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addTopographys: (state, action: PayloadAction<TopographyPoint[]>) => {
      state.topography = action.payload;
    },
    updateProjectFilter: (state, action: PayloadAction<ProjectFilter>) => {
      state.projectFilter = action.payload;
    },
    updateCavityId: (state, action: PayloadAction<string>) => {
      state.cavity_id = action.payload;
    },
    updateTopography: (state, action: PayloadAction<UpdateDataPayload>) => {
      const { path, value } = action.payload;
      state.error = null;
      let current = state.topography as any;

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
          console.error("updateTopographyData received an empty path.");
          state.error = "Error updating data: Received empty path.";
        }
      } catch (error: any) {
        console.error("Error updating topography data:", { path, value, error });
        state.error =
          error.message || `Failed to update field at path: ${path.join(".")}`;
      }
    }
  }
})

export const {
  addTopographys,
  resetTopographyState,
  setError,
  setLoading,
  updateCurrentStep,
  updateTopography,
  updateProjectFilter,
  updateCavity,
  updateCavityId,
  updateMode,
  resetMode
} = topographySlice.actions;

export default topographySlice.reducer;
