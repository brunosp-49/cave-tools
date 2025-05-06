import { configureStore } from "@reduxjs/toolkit";
import cavityReducer from "./cavitySlice";
import loadingReducer from "./loadingSlice";
import userSlice from "./userSlice";

const store = configureStore({
  reducer: {
    cavity: cavityReducer,
    loading: loadingReducer,
    user: userSlice,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
