import { lazy } from "react";
import RequireAuth from "../middleware/RequireAuth";
import VendorPage from "../pages/VendorPage";

const Login = lazy(() => import("../pages/Login"));
const OTPVerification = lazy(() => import("../components/auth/OTPVerification"));
const App = lazy(() => import("../App"));
const WBTDashboard = lazy(() => import("../components/dashboard/WBTDashboard"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const TeamPage = lazy(() => import("../pages/TeamPage"));
const FabricatorPage = lazy(() => import("../pages/FabricatorPage"));
const ChatPage = lazy(() =>
  import("../pages/ChatPage").then((m) => ({ default: m.ChatPage })),
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
const SalesDashboard = lazy(() => import("../components/sales/SalesDashboard"));
const ClientDashboard = lazy(
  () => import("../components/dashboard/ClientDashboard"),
);
const ConnectionDesignerDashboard = lazy(
  () => import("../components/dashboard/ConnectionDesignerDashboard"),
);
const WireTransferPage = lazy(() => import("../pages/WireTransferPage"));
const RFIDetailsRoute = lazy(() => import("../components/rfi/RFIDetailsRoute"));
const RFQDetailsRoute = lazy(() => import("../components/rfq/RFQDetailsRoute"));
const SubmittalDetailsRoute = lazy(() => import("../components/submittals/SubmittalDetailsRoute"));
const CODetailsRoute = lazy(() => import("../components/co/CODetailsRoute"));
const InternalRFQDetailsRoute = lazy(() => import("../components/rfq/InternalRFQDetailsRoute"));
const CDQuotaDetailsRoute = lazy(() => import("../components/connectionDesigner/CDQuotaDetailsRoute"));
const CDRFQDetailsRoute = lazy(() => import("../components/connectionDesigner/CDRFQDetailsRoute"));

const routes = [
  { path: "/", Component: Login },
  { path: "/login", Component: Login },
  { path: "/verify-challenge", Component: OTPVerification },
  { path: "/rfi/:id", Component: RFIDetailsRoute },
  { path: "/rfq/:id", Component: RFQDetailsRoute },
  { path: "/submittals/:id", Component: SubmittalDetailsRoute },
  { path: "/co/:id", Component: CODetailsRoute },
  { path: "/internal-rfq/:id", Component: InternalRFQDetailsRoute },
  { path: "/cd-quota/:id", Component: CDQuotaDetailsRoute },
  { path: "/cd-rfq/:id", Component: CDRFQDetailsRoute },
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
          { path: "vendor", Component: VendorPage },
          { path: "fabricator", Component: FabricatorPage },
          { path: "estimation", Component: EstimationPage },
          { path: "projects", Component: ProjectPage },
          { path: "invoices", Component: invoicePage },
          { path: "tasks", Component: TaskPage },
          { path: "chats", Component: ChatPage },
          { path: "rfq", Component: RFQPage },
          { path: "rfi", Component: RFIPage },
          { path: "sales", Component: SalesDashboard },
          { path: "client", Component: ClientDashboard },
          { path: "connection-designer-dashboard", Component: ConnectionDesignerDashboard },
          { path: "wire-transfer", Component: WireTransferPage },
        ],
      },
    ],
  },
];
export default routes;
