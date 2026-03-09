import { createSlice } from "@reduxjs/toolkit";

interface UIState {
  activeModalCount: number;
}

const initialState: UIState = {
  activeModalCount: 0,
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
  },
});

export const { incrementModalCount, decrementModalCount, resetModalCount } =
  uiSlice.actions;
export default uiSlice.reducer;
