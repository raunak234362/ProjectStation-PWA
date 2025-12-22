/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { ProjectData } from "../interface";

interface ProjectState {
  projectData: ProjectData[];
}

const initialState: ProjectState = {
  projectData: [],
};

const projectSlice = createSlice({
  name: "projectInfo",
  initialState,
  reducers: {
    setProjectData: (state, action: PayloadAction<ProjectData[]>) => {
      state.projectData = action.payload;
    },
    addProject: (state, action: PayloadAction<ProjectData>) => {
      state.projectData.push(action.payload);
    },
    updateProject: (state, action: PayloadAction<ProjectData>) => {
      state.projectData = state.projectData.map((project) =>
        project.id === action.payload.id
          ? { ...project, ...action.payload }
          : project
      );
    },
    deleteProject: (state, action: PayloadAction<string>) => {
      state.projectData = state.projectData.filter(
        (project) => project.id !== action.payload
      );
    },
  },
});

export const { setProjectData, addProject, updateProject, deleteProject } =
  projectSlice.actions;

export default projectSlice.reducer;
