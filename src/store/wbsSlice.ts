import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { WBSData } from "../interface";

interface WBSState {
  wbsByProject: Record<string, WBSData[]>;
}

const initialState: WBSState = {
  wbsByProject: {},
};

const wbsSlice = createSlice({
  name: "wbs",
  initialState,
  reducers: {
    setWBSForProject: (
      state,
      action: PayloadAction<{ projectId: string; wbs: WBSData[] }>
    ) => {
      state.wbsByProject[action.payload.projectId] = action.payload.wbs;
    },
    clearWBS: (state) => {
      state.wbsByProject = {};
    },
  },
});

export const { setWBSForProject, clearWBS } = wbsSlice.actions;
export default wbsSlice.reducer;
