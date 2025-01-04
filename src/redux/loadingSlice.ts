import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: false,
  hasError: false,
  errorTitle: "",
  errorMessage: "",
};

const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
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
  },
});

export const { setIsLoading, showError, hideError } = loadingSlice.actions;
export default loadingSlice.reducer;
