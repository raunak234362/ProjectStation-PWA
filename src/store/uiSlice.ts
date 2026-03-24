import { createSlice } from "@reduxjs/toolkit";

interface UIState {
  activeModalCount: number;
  fileError: {
    isOpen: boolean;
    reason: string;
    retryAction?: any;
  };
}

const initialState: UIState = {
  activeModalCount: 0,
  fileError: {
    isOpen: false,
    reason: "",
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    incrementModalCount: (state) => {
      state.activeModalCount += 1;
    },
    decrementModalCount: (state) => {
      state.activeModalCount = Math.max(0, state.activeModalCount - 1);
    },
    resetModalCount: (state) => {
      state.activeModalCount = 0;
    },
    showFileError: (state, action) => {
      state.fileError = {
        isOpen: true,
        reason: action.payload.reason,
        retryAction: action.payload.retryAction,
      };
    },
    hideFileError: (state) => {
      state.fileError.isOpen = false;
    },
  },
});

export const { 
    incrementModalCount, 
    decrementModalCount, 
    resetModalCount,
    showFileError,
    hideFileError
} = uiSlice.actions;
export default uiSlice.reducer;
