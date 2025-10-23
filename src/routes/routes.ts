import Login from "../pages/Login";
import App from "../App";
import Layout from "../layout/DashboardLayout";
const routes = [
  { path: "/", Component: Login },
  {
    path: "/dashboard",
    Component: Layout,
    children: [{ path: "", Component: "Layout" }],
  },
];
export default routes;
