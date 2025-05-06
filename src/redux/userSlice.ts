import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { resetLoadingState, setIsLoading } from "./loadingSlice";
import {
  deleteAllCavities,
  deleteAllProjects,
  deleteUser,
} from "../db/controller";

// Define the shape of the state managed by this slice
interface UserState {
  isLoading: boolean;
  hasProjects: boolean;
  checked: boolean;
  networkOff: boolean;
  userHasNotProjects: boolean;
  showExpirationWarning: boolean;
  daysToExpire: number;
  isModalVisible: boolean; // Added to control modal visibility itself if needed
  searchCharacterization: string;
}

// Define the initial state
const initialState: UserState = {
  isLoading: false,
  hasProjects: false,
  checked: false,
  networkOff: false,
  userHasNotProjects: false,
  showExpirationWarning: false,
  daysToExpire: 0,
  isModalVisible: false, // Assuming modal starts hidden
  searchCharacterization: "",
};

const userStateSlice = createSlice({
  name: "userState", // Name of the slice
  initialState,
  reducers: {
    // Action to set loading state
    setModalLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    // Action to set hasProjects state
    setModalHasProjects: (state, action: PayloadAction<boolean>) => {
      state.hasProjects = action.payload;
    },
    // Action to set checked state
    setModalChecked: (state, action: PayloadAction<boolean>) => {
      state.checked = action.payload;
    },
    // Action to set networkOff state
    setModalNetworkOff: (state, action: PayloadAction<boolean>) => {
      state.networkOff = action.payload;
    },
    // Action to set userHasNotProjects state
    setModalUserHasNotProjects: (state, action: PayloadAction<boolean>) => {
      state.userHasNotProjects = action.payload;
    },
    // Action to set expiration warning state
    setModalExpirationWarning: (
      state,
      action: PayloadAction<{ show: boolean; days: number }>
    ) => {
      state.showExpirationWarning = action.payload.show;
      state.daysToExpire = action.payload.days;
    },
    // Action to control modal visibility
    setModalVisibility: (state, action: PayloadAction<boolean>) => {
      state.isModalVisible = action.payload;
    },
    // Action to reset the entire modal state to initial values
    resetModalState: (state) => {
      // Can either return initialState or manually reset each field
      state.isLoading = false;
      state.hasProjects = false;
      state.checked = false;
      state.networkOff = false;
      state.userHasNotProjects = false;
      state.showExpirationWarning = false;
      state.daysToExpire = 0;
      state.isModalVisible = false;
    },
    onChangeSearchCharacterization: (state, action: PayloadAction<string>) => {
      state.searchCharacterization = action.payload;
    },
  },
});

export const logoffUser = createAsyncThunk(
  "user/logoff", // Action type prefix
  async (navigation: any, { dispatch }) => {
    try {
      dispatch(setModalLoading(true)); // Show loading during logoff
      await deleteAllProjects();
      await deleteAllCavities();
      dispatch(resetModalState());
      await deleteUser("2"); // FIXME: Hardcoded user ID '2'
      dispatch(resetLoadingState()); // <<< Reset Redux state for the modal
      navigation.navigate("Login"); // Navigate AFTER resetting state
      dispatch(setModalLoading(false));
    } catch (error) {
      console.error("Error during logoff:", error);
      // Handle logoff error (e.g., show message)
      dispatch(setModalLoading(false)); // Turn off loading indicator on error
      // Reset state even on error to ensure clean state? Or leave as is?
      // dispatch(resetModalState());
    }
  }
);

// Export the action creators
export const {
  setModalLoading,
  setModalHasProjects,
  setModalChecked,
  setModalNetworkOff,
  setModalUserHasNotProjects,
  setModalExpirationWarning,
  setModalVisibility,
  resetModalState,
  onChangeSearchCharacterization,
} = userStateSlice.actions;

// Export the reducer
export default userStateSlice.reducer;
