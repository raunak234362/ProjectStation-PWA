 
 
import { Navigate, Outlet, useLocation } from "react-router-dom";
// import { useSelector } from "react-redux";

// Define your RootState type for Redux
// interface RootState {
//   userData: {
//     userData: {
//       is_firstLogin?: boolean;
//       [key: string]: any;
//     };
//   };
// }

const RequireAuth: React.FC = () => {
  const token: string | null = sessionStorage.getItem("token");
  const location = useLocation();
//   const userInfo = useSelector((state: RootState) => state.userData.userData);
//   const navigate = useNavigate();

  // Optional redirect logic for first-time login (commented out by default)
  // useEffect(() => {
  //   if (token && userInfo?.is_firstLogin) {
  //     navigate("/change-password/");
  //   }
  // }, [token, userInfo, navigate]);

  if (!token) {
    const targetUrl = location.pathname + location.search;
    return <Navigate to={`/?redirect=${encodeURIComponent(targetUrl)}`} replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
