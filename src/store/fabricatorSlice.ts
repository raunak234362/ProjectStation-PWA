/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Branch, Fabricator } from "../interface";


interface FabricatorState {
  fabricatorData: Fabricator[];
  clientData: any[]; // can be typed later
}

const initialState: FabricatorState = {
  fabricatorData: [],
  clientData: [],
};

const fabricatorSlice = createSlice({
  name: "fabricatorData",
  initialState,
  reducers: {
    addFabricator: (state, action: PayloadAction<Fabricator>) => {
      state.fabricatorData.push(action.payload);
    },

    loadFabricator: (state, action: PayloadAction<Fabricator[]>) => {
      state.fabricatorData = action.payload;
    },

    updateFabricator: (state, action: PayloadAction<Fabricator>) => {
      const updatedFab = action.payload;
      state.fabricatorData = state.fabricatorData.map((fab) =>
        fab.id === updatedFab.id ? updatedFab : fab
      );
    },

    // ✅ Add a branch
    addBranchToFabricator: (
      state,
      action: PayloadAction<{ fabricatorId: string; branchData: Branch }>
    ) => {
      const { fabricatorId, branchData } = action.payload;
      state.fabricatorData = state.fabricatorData.map((fab) =>
        fab.id === fabricatorId
          ? {
              ...fab,
              branches: [...fab.branches, branchData],
            }
          : fab
      );
    },

    // ✅ Update a branch (replace same branch by id)
    updateFabricatorBranch: (
      state,
      action: PayloadAction<{ fabricatorId: string; branchData: Branch }>
    ) => {
      const { fabricatorId, branchData } = action.payload;
      state.fabricatorData = state.fabricatorData.map((fab) =>
        fab.id === fabricatorId
          ? {
              ...fab,
              branches: fab.branches?.map((branch) =>
                branch.id === branchData.id ? branchData : branch
              ),
            }
          : fab
      );
    },

    addClient: (state, action: PayloadAction<any>) => {
      state.clientData.push(action.payload);
    },

    showClient: (state, action: PayloadAction<any[]>) => {
      state.clientData = action.payload;
    },

    deleteFabricator: (state, action: PayloadAction<string>) => {
      state.fabricatorData = state.fabricatorData.filter(
        (fab) => fab.id !== action.payload
      );
    },
  },
});

export const {
  addFabricator,
  loadFabricator,
  updateFabricator,
  addBranchToFabricator,
  updateFabricatorBranch,
  deleteFabricator,
  addClient,
  showClient,
} = fabricatorSlice.actions;

export default fabricatorSlice.reducer;
