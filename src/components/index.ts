import Login from "./auth/Login";
// WBTDashboard is now exported directly below

import Profile from "./profile/Profile";

//Employees Components-
import AddEmployee from "./manageTeam/employee/AddEmployee";
import AllEmployee from "./manageTeam/employee/AllEmployee";

//Department Components-
import AddDepartment from "./manageTeam/department/AddDepartment";
import AllDepartments from "./manageTeam/department/AllDepartments";

//Connection Designer
import AddConnectionDesigner from "./connectionDesigner/designer/AddConnectionDesigner";
import AllConnectionDesigner from "./connectionDesigner/designer/AllConnectionDesigner";
import AddCDEngineer from "./connectionDesigner/engineer/AddCDEngineer";
import AllCDEngineer from "./connectionDesigner/engineer/AllCDEngineer";

//Estimation Components-
import AddEstimation from "./estimation/AddEstimation";
import AllEstimation from "./estimation/AllEstimation";

// Projects
import AddProject from "./project/AddProject";
import AllProjects from "./project/AllProjects";
import ProjectDashboard from "./dashboard/ProjectDashboard";

//Invoices
import AddInvoice from "./invoices/AddInvoice";
import AllInvoices from "./invoices/AllInvoices";
import GetInvoiceById from "./invoices/GetInvoiceById";
import InvoiceDashboard from "./invoices/dashboard/InvoiceDashboard";
import TeamDashboard from "./manageTeam/teamDashboard/TeamDashboard";

export {
  Login,
  // WBTDashboard is now exported directly below
  Profile,
  AddEmployee,
  AllEmployee,
  AddDepartment,
  AllDepartments,
  AllCDEngineer,
  AddConnectionDesigner,
  AllConnectionDesigner,
  AddCDEngineer,
  AddProject,
  AllProjects,
  AddEstimation,
  AllEstimation,
  ProjectDashboard,
  AddInvoice,
  AllInvoices,
  GetInvoiceById,
  InvoiceDashboard,
  TeamDashboard,
};


export { default as WBTDashboard } from "./dashboard/WBTDashboard";
