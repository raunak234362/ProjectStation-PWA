/* eslint-disable @typescript-eslint/no-unused-vars */
import { Provider, useDispatch } from "react-redux";
import store from "./store/store";
import Layout from "./layout/DashboardLayout";
import Service from "./api/Service";
import { setUserData, showStaff } from "./store/userSlice";
import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import socket, { connectSocket } from "./socket";
import PWABadge from "./PWABadge";
import { loadFabricator } from "./store/fabricatorSlice";

const AppContent = () => {
  const dispatch = useDispatch();
  // const [setUserId] = useState<string | null>(null);

  // Fetch current user
  const fetchSignedinUser = async () => {
    try {
      const response = await Service.GetUserByToken();
      const userDetail = response?.data?.user;
      if (!userDetail?.id) throw new Error("Invalid user");

      sessionStorage.setItem("userId", userDetail.id);
      sessionStorage.setItem("username", userDetail.username);

      // setUserId(userDetail.id);
      dispatch(setUserData(userDetail));

      // Connect socket after user is set
      connectSocket(userDetail.id);
    } catch (err) {
      console.error("User fetch failed:", err);
      toast.error("Failed to load user");
    }
  };

  useEffect(() => {
    // Fetch user once on mount
    fetchSignedinUser();

    // Fetch all employees
    const fetchAllEmployee = async () => {
      try {
        const response = await Service.FetchAllEmployee();
        const data = response?.data?.employees || [];
        dispatch(showStaff(data));
      } catch (err) {
        console.error("Failed to fetch employees:", err);
        toast.error("Failed to load employees");
      }
    };
    // Fetch all fabricator
    const fetchAllFabricator = async () => {
      try {
        const response = await Service.GetAllFabricators();
        const data = response.data || [];
        dispatch(loadFabricator(data));
      } catch (err) {
        console.error("Failed to fetch employees:", err);
        toast.error("Failed to load employees");
      }
    };

    fetchAllFabricator();
    fetchAllEmployee();

    // Cleanup socket on unmount
    return () => {
      if (socket.connected) {
        socket.disconnect();
        console.log("🧹 Socket disconnected on unmount");
      }
    };
  }, [dispatch]);

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />

      <Layout />
    </>
  );
};

const App = () => (
  <Provider store={store}>
    <AppContent />
    <PWABadge />
  </Provider>
);

export default App;
