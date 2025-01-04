import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentStep: 0,
};

const cavitySlice = createSlice({
  name: 'cavity',
  initialState,
  reducers: {
    updateCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
  },
});

export const { updateCurrentStep } = cavitySlice.actions;
export default cavitySlice.reducer;
