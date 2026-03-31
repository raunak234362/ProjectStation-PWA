import { createSlice } from "@reduxjs/toolkit";

interface UIState {
  activeModalCount: number;
  activeDetailView: {
    type: "SUBMITTAL" | "RFI" | "RFQ" | "MILESTONE" | "PROJECT" | "TASK" | "CHANGE_ORDER" | null;
    id: string | number | null;
    projectId?: string | number | null;
  };
  fileError: {
    isOpen: boolean;
    reason: string;
    retryAction?: any;
  };
}

const initialState: UIState = {
  activeModalCount: 0,
  activeDetailView: {
    type: null,
    id: null,
  },
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
    openDetailView: (state, action: { payload: { type: UIState["activeDetailView"]["type"], id: string | number, projectId?: string | number } }) => {
      state.activeDetailView = action.payload;
    },
    closeDetailView: (state) => {
      state.activeDetailView = { type: null, id: null, projectId: null };
    },
  },
});

export const { 
    incrementModalCount, 
    decrementModalCount, 
    resetModalCount,
    showFileError,
    hideFileError,
    openDetailView,
    closeDetailView
} = uiSlice.actions;
export default uiSlice.reducer;
