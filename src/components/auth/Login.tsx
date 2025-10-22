
import { useForm } from "react-hook-form";
import type { AuthInterface } from "../../interface";
import AuthService from "../../api/auth";
import Background from "../../assets/background-image.jpg";
import LOGO from "../../assets/logo.png";
import Input from "../fields/input";
import Button from "../fields/Button";

const Login = () => {
  const { register, handleSubmit } = useForm<AuthInterface>();

  const Submit = async (data: AuthInterface) => {
    try {
      const userLogin = await AuthService.login(data);
      console.log("Login Successful:", userLogin);
      alert("Login Successful!");
    } catch (error) {
      console.error("Error While Logging in:", error);
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="relative">
      {/* Background blur */}
      <img
        src={Background}
        alt="background"
        className="absolute inset-0 h-full w-full object-cover blur-[8px] z-0"
      />

      <div className="relative z-10 grid w-screen h-screen grid-cols-1 md:grid-cols-2">
        {/* Logo section */}
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-center px-2 mx-20 bg-white border-4 bg-opacity-70 rounded-2xl md:py-14 md:px-20">
            <img src={LOGO} alt="Logo" />
          </div>
        </div>

        {/* Login form */}
        <div className="flex items-center bg-black/70 backdrop-blur-lg justify-center">
          
            <div className="bg-white/10  shadow-2xl shadow-teal-100 bg-opacity-90 h-fit w-full md:w-2/3 rounded-2xl  border-4 border-teal-500 p-5">
              <h1 className="mb-10 text-4xl font-bold text-center text-white">
                Login
              </h1>

              <form
                onSubmit={handleSubmit(Submit)}
                className="flex flex-col w-full gap-5"
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
