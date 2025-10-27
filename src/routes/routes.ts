import Login from "../pages/Login";
import App from "../App";
import RequireAuth from "../middleware/RequireAuth";
import { WBTDashboard } from "../components";
import ProfilePage from "../pages/ProfilePage";
import TeamPage from "../pages/TeamPage";
// import Layout from "../layout/DashboardLayout";
const routes = [
  { path: "/", Component: Login },
  { path: "/change-password", Component: "Password Change" },
  {
    Component: RequireAuth,
    children: [
      {
        path: "/dashboard",
        Component: App,
        children: [{ path: "", Component: WBTDashboard },
          {path:"profile", Component: ProfilePage},
          {path:"manage-team", Component: TeamPage}
        ],
      },
    ],
  },
];
export default routes;
