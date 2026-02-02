import { useForm } from "react-hook-form";
import type { AuthInterface } from "../../interface";
import AuthService from "../../api/auth";
import Background from "../../assets/Green Banana Leaf Pattern Reminder Facebook Post(1).jpg";
import LOGO from "../../assets/logo.png";
import Input from "../fields/input";
import Button from "../fields/Button";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login, setUserData } from "../../store/userSlice";

const Login = () => {
  const { register, handleSubmit } = useForm<AuthInterface>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const Submit = async (data: AuthInterface) => {
    try {
      const userLogin = await AuthService.login(data);
      const token = userLogin?.data?.token || userLogin?.token;
      const userDetail = userLogin?.data?.user || userLogin?.user;

      if (!token) {
        throw new Error("Invalid Credentials: Token not found in response");
      }

      sessionStorage.setItem("token", token);
      if (userDetail?.role) {
        sessionStorage.setItem("userRole", userDetail.role);
      }

      dispatch(login(token));
      if (userDetail) {
        dispatch(setUserData(userDetail));
      }

      if (
        userDetail?.role?.toLowerCase() === "sales" ||
        userDetail?.role?.toLowerCase() === "sales_manager"
      ) {
        navigate("/dashboard/sales");
      } else if (
        userDetail?.role?.toLowerCase() === "connection_designer_engineer"
      ) {
        navigate("/dashboard/designer");
      } else {
        navigate("/dashboard");
      }
      console.log("Login Successful:", userLogin);
    } catch (error: any) {
      console.error("Error While Logging in:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Login failed. Please check your credentials.";
      alert(errorMessage);
    }
  };

  return (
    <div className="relative">
      {/* Background blur */}
      <img
        src={Background}
        alt="background"
        className="absolute inset-0 h-full w-full object-cover blur-sm z-0"
      />

      <div className="relative z-10 grid w-screen h-screen grid-cols-1 md:grid-cols-2">
        {/* Logo section */}
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-center px-2 mx-20 shadow-2xl shadow-green-950 bg-white border-4 bg-opacity-70 rounded-2xl md:py-14 md:px-20">
            <img src={LOGO} alt="Logo" />
          </div>
        </div>

        {/* Login form */}
        <div className="flex items-center bg-black/70 backdrop-blur-lg justify-center">
          <div className="bg-green-100/40 bg-opacity-90 h-fit w-full md:w-2/3 rounded-2xl  border- border-green-900 p-5">
            <h1 className="mb-10 text-4xl font-bold text-center text-gray-900 ">
              Login
            </h1>

            <form
              onSubmit={handleSubmit(Submit)}
              className="flex flex-col w-full gap-5 "
            >
              <div>
                <Input
                  label="Username:"
                  placeholder="USERNAME"
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
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
              </div>
              <div className="flex justify-center w-full my-5">
                <Button type="submit">Sign In</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
