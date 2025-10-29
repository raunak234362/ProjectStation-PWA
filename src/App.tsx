import { Provider, useDispatch } from "react-redux";
import store from "./store/store";
import Layout from "./layout/DashboardLayout";
import Service from "./api/Service";
import { setUserData, showStaff } from "./store/userSlice";
import { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";

const App = () => {
  const dispatch = useDispatch();
  const fetchSignedinUser = async () => {
    const response = await Service.GetUserByToken();
    const userDetail = response?.data?.user;
    console.log(userDetail);
    dispatch(setUserData(userDetail));
  };

  useEffect(() => {
    const fetchAllEmployee = async () => {
      try {
        const response = await Service.FetchAllEmployee();

        // Adjust based on your API response structure
        const data = response?.data.employees || [];
        dispatch(showStaff(data))
        console.log(data)
      } catch (err) {
        console.error("Failed to fetch employees:", err);
        toast.error("Failed to load employees");
      }
    };
    fetchAllEmployee();
  }, []);

  useEffect(() => {
    fetchSignedinUser();
  }, []);

  return (
    <div>
      <Provider store={store}>
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Layout />
      </Provider>
    </div>
  );
};

export default App;
