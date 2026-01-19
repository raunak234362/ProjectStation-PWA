import { lazy } from "react";
import RequireAuth from "../middleware/RequireAuth";

const Login = lazy(() => import("../pages/Login"));
const App = lazy(() => import("../App"));
const WBTDashboard = lazy(() => import("../components/dashboard/WBTDashboard"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const TeamPage = lazy(() => import("../pages/TeamPage"));
const FabricatorPage = lazy(() => import("../pages/FabricatorPage"));
const ChatPage = lazy(() =>
  import("../pages/ChatPage").then((m) => ({ default: m.ChatPage }))
);
const RFQPage = lazy(() => import("../pages/RFQPage"));
const ConnectionPage = lazy(() => import("../pages/ConnectionPage"));
const ChangePasswordPage = lazy(() => import("../pages/ChangePasswordPage"));
const RFIPage = lazy(() => import("../pages/RFIPage"));
const EstimationPage = lazy(() => import("../pages/EstimationPage"));
const ProjectPage = lazy(() => import("../pages/ProjectPage"));
const invoicePage = lazy(() => import("../pages/invoicePage"));
const TaskPage = lazy(() => import("../pages/TaskPage"));
const CoTablePage = lazy(() => import("../components/co/CoTablePage"));
const AccountPage = lazy(() => import("../pages/AccountPage"));
const SalesDashboard = lazy(() => import("../components/sales/SalesDashboard"));

const routes = [
  { path: "/", Component: Login },
  {
    path: "/co-table",
    Component: CoTablePage,
  },
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
          { path: "accounts", Component: AccountPage },
          { path: "chats", Component: ChatPage },
          { path: "rfq", Component: RFQPage },
          { path: "rfi", Component: RFIPage },
          { path: "sales", Component: SalesDashboard },
        ],
      },
    ],
  },
];
export default routes;
