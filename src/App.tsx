import { Provider, useDispatch } from "react-redux";
import store from "./store/store";
import Layout from "./layout/DashboardLayout";
import Service from "./api/Service";
import { setUserData } from "./store/userSlice";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";

const App = () => {
  const dispatch = useDispatch();
  const fetchSignedinUser = async () => {
    const response = await Service.GetUserByToken();
    const userDetail = response?.data?.user;
    console.log(userDetail);
    dispatch(setUserData(userDetail));
  };

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
