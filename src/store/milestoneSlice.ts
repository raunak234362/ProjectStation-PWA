import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ProjectMilestone } from "../interface";

interface MilestoneState {
  milestonesByProject: Record<string, ProjectMilestone[]>;
}

const initialState: MilestoneState = {
  milestonesByProject: {},
};

const milestoneSlice = createSlice({
  name: "milestones",
  initialState,
  reducers: {
    setMilestonesForProject: (
      state,
      action: PayloadAction<{
        projectId: string;
        milestones: ProjectMilestone[];
      }>
    ) => {
      state.milestonesByProject[action.payload.projectId] =
        action.payload.milestones;
    },
    clearMilestones: (state) => {
      state.milestonesByProject = {};
    },
  },
});

export const { setMilestonesForProject, clearMilestones } =
  milestoneSlice.actions;
export default milestoneSlice.reducer;
