import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import fabricatorReducer from "./fabricatorSlice";
const store = configureStore({
  reducer: {
    userInfo: userReducer,
    fabricatorInfo: fabricatorReducer,
  },
});

export default store;
