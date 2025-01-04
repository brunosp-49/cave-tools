import { configureStore } from "@reduxjs/toolkit";
import cavityReducer from "./cavitySlice";
import loadingReducer from "./loadingSlice";

const store = configureStore({
  reducer: {
    cavity: cavityReducer,
    loading: loadingReducer,
  },
});

export default store;
