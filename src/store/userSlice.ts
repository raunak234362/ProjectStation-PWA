/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { UserData } from "../interface";

// Define interfaces
interface Department {
  id: string;
  name?: string;
  [key: string]: any;
}

interface Team {
  id: string;
  name?: string;
  [key: string]: any;
}

interface Staff {
  id: string;
  name?: string;
  [key: string]: any;
}


interface UserState {
  token: string | boolean;
  userData: UserData | null;
  departmentData: Department[];
  teamData: Team[];
  staffData: Staff[];
}

// Initial state
const initialState: UserState = {
  token: false,
  userData: null,
  departmentData: [],
  teamData: [],
  staffData: [],
};

// Slice
const userSlice = createSlice({
  name: "userdata",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<UserData & { token?: string }>) => {
      state.userData = action.payload;
      const token = (action.payload as any).token;
      if (token) {
        state.token = token;
        sessionStorage.setItem("token", token);
      }
    },
    setUserData: (state, action: PayloadAction<UserData>) => {
      // state.token = action.payload.token || false;
      state.userData = action.payload;
    },
    addStaff: (state, action: PayloadAction<Staff>) => {
      state.staffData.push(action.payload);
    },
    showStaff: (state, action: PayloadAction<Staff[]>) => {
      state.staffData = action.payload;
    },
    updateStaffData: (state, action: PayloadAction<Staff>) => {
      state.staffData = state.staffData.map((staff) =>
        staff.id === action.payload.id ? { ...staff, ...action.payload } : staff
      );
    },
    addTeam: (state, action: PayloadAction<Team>) => {
      state.teamData.push(action.payload);
    },
    showTeam: (state, action: PayloadAction<Team[]>) => {
      state.teamData = action.payload;
    },
    updateTeamData: (state, action: PayloadAction<Team>) => {
      state.teamData = state.teamData.map((team) =>
        team.id === action.payload.id ? { ...team, ...action.payload } : team
      );
    },
    addDepartment: (state, action: PayloadAction<Department>) => {
      state.departmentData.push(action.payload);
    },
    updateDepartmentData: (state, action: PayloadAction<Department>) => {
      state.departmentData = state.departmentData.map((department) =>
        department.id === action.payload.id
          ? { ...department, ...action.payload }
          : department
      );
    },
    showDepartment: (state, action: PayloadAction<Department[]>) => {
      state.departmentData = action.payload;
    },
    logout: (state) => {
      state.token = false;
      state.userData = null;
      sessionStorage.removeItem("token");
    },
    updatetoken: (state, action: PayloadAction<{ token: string }>) => {
      state.token = action.payload.token;
      sessionStorage.setItem("token", action.payload.token);
    },
  },
});

// Export actions and reducer
export const {
  login,
  showStaff,
  addStaff,
  setUserData,
  updateStaffData,
  updateTeamData,
  addDepartment,
  showDepartment,
  addTeam,
  showTeam,
  updatetoken,
  updateDepartmentData,
  logout,
} = userSlice.actions;

export default userSlice.reducer;
