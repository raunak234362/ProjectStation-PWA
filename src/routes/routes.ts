import Login from "../pages/Login";
import App from "../App";
import RequireAuth from "../middleware/RequireAuth";
import { WBTDashboard } from "../components";
import ProfilePage from "../pages/ProfilePage";
import TeamPage from "../pages/TeamPage";
import FabricatorPage from "../pages/FabricatorPage";
import { ChatPage } from "../pages/ChatPage";
import RFQPage from "../pages/RFQPage";
import ConnectionPage from "../pages/ConnectionPage";
import ChangePasswordPage from "../pages/ChangePasswordPage";
import RFIPage from "../pages/RFIPage";
import EstimationPage from "../pages/EstimationPage";
import ProjectPage from "../pages/ProjectPage";
import TaskPage from "../pages/TaskPage";
import invoicePage from "../pages/invoicePage";
import AccountPage from "../pages/AccountPage";

// import Layout from "../layout/DashboardLayout";
const routes = [
  { path: "/", Component: Login },
  { path: "/change-password", Component: ChangePasswordPage },
  {
    Component: RequireAuth,
    children: [
      {
        path: "/dashboard",
        Component: App,
        children: [
          { path: "", Component: WBTDashboard },
          { path: "profile", Component: ProfilePage },
          { path: "manage-team", Component: TeamPage },
          { path: "connection-designer", Component: ConnectionPage },
          { path: "fabricator", Component: FabricatorPage },
          { path: "estimation", Component: EstimationPage },
          { path: "projects", Component: ProjectPage },
          { path: "invoices", Component: invoicePage },
          { path: "tasks", Component: TaskPage },
          { path: "chats", Component: ChatPage },
          { path: "rfq", Component: RFQPage },
          { path: "rfi", Component: RFIPage },
          { path: "accounts", Component: AccountPage },
        ],
      },
    ],
  },
];
export default routes;
