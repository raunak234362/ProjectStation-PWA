import { useForm } from "react-hook-form";
import { useEffect } from "react";
import type { AuthInterface } from "../../interface";
import AuthService from "../../api/auth";
import Background from "../../assets/Green Banana Leaf Pattern Reminder Facebook Post(1).jpg";
import LOGO from "../../assets/logo.png";
import Input from "../fields/input";
import Button from "../fields/Button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login, setUserData } from "../../store/userSlice";
import { connectSocket } from "../../socket";

const Login = () => {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<AuthInterface>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      const redirectUrl = searchParams.get("redirect") || sessionStorage.getItem("redirectUrl");
      if (redirectUrl) {
        sessionStorage.removeItem("redirectUrl");
        navigate(redirectUrl);
      } else {
        navigate("/dashboard");
      }
    }
  }, [navigate, searchParams]);

  const Submit = async (data: AuthInterface) => {
    try {
      const userLogin = await AuthService.login(data);
      // Check if OTP verification is required
      if (userLogin?.requiresVerification || userLogin?.data?.requiresVerification) {
        const challengeToken = userLogin?.challengeToken || userLogin?.data?.challengeToken;
        if (challengeToken) {
          sessionStorage.setItem("challengeToken", challengeToken);
          const redirectUrl = searchParams.get("redirect");
          if (redirectUrl) {
            sessionStorage.setItem("redirectUrl", redirectUrl);
          }
          navigate("/verify-challenge");
          return;
        }
      }

      const token = userLogin?.data?.token || userLogin?.token;
      const userDetail = userLogin?.data?.user || userLogin?.user;

      if (!token) {
        throw new Error("Invalid Credentials: Token not found in response");
      }

      sessionStorage.setItem("token", token);
      connectSocket(token);
      const role = userDetail?.role || userDetail?.userRole || userLogin?.data?.role || userLogin?.data?.userRole || userLogin?.role;
      if (role) {
        sessionStorage.setItem("userRole", role);
      } else {
        console.warn("User role not found in response", userLogin);
      }

      dispatch(login(token));
      if (userDetail) {
        dispatch(setUserData(userDetail));
      }

      const redirectUrl = searchParams.get("redirect") || sessionStorage.getItem("redirectUrl");
      if (redirectUrl) {
        sessionStorage.removeItem("redirectUrl");
        navigate(redirectUrl);
      } else {
        navigate("/dashboard");
      }
      
      console.log("Login Successful:", userLogin);
    } catch (error: any) {
      console.error("Error While Logging in:", error);
      // Let's check for 202 that might have been caught if axios was configured differently, though typically 202 goes to the success block.
      if (error?.response?.status === 202) {
        const data = error.response.data;
        if (data?.requiresVerification) {
          const challengeToken = data.challengeToken;
          if (challengeToken) {
            sessionStorage.setItem("challengeToken", challengeToken);
            const redirectUrl = searchParams.get("redirect");
            if (redirectUrl) {
              sessionStorage.setItem("redirectUrl", redirectUrl);
            }
            navigate("/verify-challenge");
            return;
          }
        }
      }
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Login failed. Please check your credentials.";
      alert(errorMessage);
    }
  };

  return (
    <div className="relative" style={{ textTransform: 'none' }}>
      {/* Background blur */}
      <img
        src={Background}
        alt="background"
        className="absolute inset-0 h-full w-full object-cover blur-sm z-0"
      />

      <div className="relative z-10 grid w-screen min-h-screen grid-cols-1 md:grid-cols-2 overflow-x-hidden">
        {/* Logo section */}
        <div className="flex items-center justify-center md:min-h-screen">
          <div className="flex items-center justify-center p-6 md:p-16 shadow-2xl shadow-green-950/20 bg-white/90 backdrop-blur-sm border-4 border-white rounded-[6px] mx-6 md:mx-20">
            <img src={LOGO} alt="Logo" className="max-w-[220px] md:max-w-md w-full h-auto" />
          </div>
        </div>

        {/* Login form */}
        <div className="flex items-center md:backdrop-blur-xl justify-center p-6 md:p-0">
          <div className="bg-white/95 h-fit w-full max-w-lg md:w-3/4 lg:w-2/3 rounded-[6px] border border-green-900/10 p-8 md:p-12 shadow-2xl shadow-green-950/20">

            {/* Welcome Message */}
            <div className="mb-8">
              <p className="text-center text-4xl md:text-5xl text-gray-700 font-light leading-tight">
                Welcome to <br />
                <span className=" text-green-700">
                  Project Station
                </span>
              </p>

              <p className="text-center text-lg text-gray-500 mt-4">
                Please Login to continue
              </p>
            </div>

            <form
              onSubmit={handleSubmit(Submit)}
              className="flex flex-col w-full gap-6"
            >
              <div>
                <Input
                  label="Username:"
                  placeholder="USERNAME"
                  className="rounded-[6px] border-gray-200 focus:border-green-600 focus:ring-green-600"
                  type="text"
                  {...register("username", {
                    required: "Username is required",
                  })}
                />
              </div>

              <div>
                <Input
                  label="Password:"
                  placeholder="PASSWORD"
                  type="password"
                  className="rounded-[6px] border-gray-200 focus:border-green-600 focus:ring-green-600"
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
              </div>

              <div className="mt-4">
                <Button type="submit" disabled={isSubmitting} className="w-full text-xl text-black border border-black bg-green-50 hover:bg-green-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
