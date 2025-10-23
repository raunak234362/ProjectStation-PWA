import React from "react";
import { Provider } from "react-redux";
import store from "./store/store";
import Layout from "./layout/DashboardLayout";

const App = () => {
  return (
    <div>
      <Provider store={store}>
        <Layout />
      </Provider>
    </div>
  );
};

export default App;
