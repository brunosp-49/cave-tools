import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  hasError: false,
  errorTitle: "",
  errorMessage: "",
  checkingLoading: true,
};

const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setIsCheckingLoading: (state, action) => {
      state.checkingLoading = action.payload;
    },
    showError: (state, action) => {
      state.hasError = true;
      state.errorTitle = action.payload.title;
      state.errorMessage = action.payload.message;
    },
    hideError: (state) => {
      state.hasError = false;
      state.errorTitle = "";
      state.errorMessage = "";
    },
    resetLoadingState: (state) => {
      state.isLoading = false;
      state.hasError = false;
      state.errorTitle = "";
      state.errorMessage = "";
      state.checkingLoading = true;
    },
  },
});

export const {
  setIsLoading,
  showError,
  hideError,
  setIsCheckingLoading,
  resetLoadingState,
} = loadingSlice.actions;
export default loadingSlice.reducer;
