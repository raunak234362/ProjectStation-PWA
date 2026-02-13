import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "./layout/DashboardLayout";
import Service from "./api/Service";
import { setUserData, showStaff } from "./store/userSlice";
import { ToastContainer, toast } from "react-toastify";
import socket, { connectSocket } from "./socket";
import PWABadge from "./PWABadge";
import { loadFabricator } from "./store/fabricatorSlice";
import { setRFQData } from "./store/rfqSlice";
import { setProjectData } from "./store/projectSlice";
import { setNotifications } from "./store/notificationSlice";
import useNotifications from "./hooks/useNotifications";

const AppContent = () => {
  const dispatch = useDispatch();
  useNotifications();
  const userType = sessionStorage.getItem("userRole");

  const projects = useSelector(
    (state: any) => state.projectInfo?.projectData || [],
  );

  // Fetch current user
  const fetchSignedinUser = async () => {
    try {
      const response = await Service.GetUserByToken();
      const userDetail = response?.data?.user;
      if (!userDetail?.id) throw new Error("Invalid user");

      sessionStorage.setItem("userId", userDetail.id);
      sessionStorage.setItem("username", userDetail.username);
      sessionStorage.setItem("userDesignation", userDetail.designation);
      sessionStorage.setItem("firstName", userDetail.firstName);
      sessionStorage.setItem(
        "connectionDesignerId",
        userDetail.connectionDesignerId,
      );

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
    if (projects.length === 0) {
      Service.GetAllProjects().then((res) => {
        dispatch(setProjectData(res.data));
      });
    }
  }, [dispatch, projects.length]);
  useEffect(() => {
    // Fetch user once on mount
    fetchSignedinUser();

    // Request notification permission
    if ("Notification" in window) {
      Notification.requestPermission();
    }

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

    const fetchNotifications = async () => {
      try {
        const response = await Service.Notifications();
        const data = response?.data || [];
        dispatch(setNotifications(data));
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        toast.error("Failed to load notifications");
      }
    };

    const fetchInboxRFQ = async () => {
      try {
        let rfqDetail;
        if (userType === "CLIENT") {
          rfqDetail = await Service.RfqSent();
        } else if (
          userType === "OPERATION_EXECUTIVE" ||
          userType === "DEPUTY_MANAGER" ||
          userType === "CLIENT" ||
          userType === "ESTIMATION_HEAD" ||
          userType === "ADMIN"
        ) {
          rfqDetail = await Service.getAllRFQ();
        } else if (userType === "CONNECTION_DESIGNER_ENGINEER") {
          const designerId = sessionStorage.getItem("connectionDesignerId");
          if (designerId) {
            rfqDetail = await Service.getConnectionEngineerQuotation();
          }
        } else {
          rfqDetail = await Service.RFQRecieved();
        }
        // setRfq(rfqDetail.data);
        console.log("Raw RFQ Response:", rfqDetail);
        const rfqData = Array.isArray(rfqDetail)
          ? rfqDetail
          : rfqDetail?.data || [];
        dispatch(setRFQData(rfqData));
        console.log("Dispatched RFQ Data:", rfqData);
      } catch (error) {
        console.error("Error fetching RFQ:", error);
      }
    };

    if (userType !== "CLIENT" && userType !== "CLIENT_ADMIN") {
      fetchAllFabricator();
    }
    fetchAllEmployee();
    fetchNotifications();
    fetchInboxRFQ();
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
      <ToastContainer position="top-right" autoClose={1000} />

      <Layout />
    </>
  );
};

const App = () => (
  <>
    <AppContent />
    <PWABadge />
  </>
);

export default App;
