import Login from "../pages/Login";
import App from "../App";
const routes = [
  { path: "/", Component: Login },
  {
    path: "/dashboard",
    Component: App,
    children: [{ path: "", element: "Hello" }],
  },
];
export default routes;
