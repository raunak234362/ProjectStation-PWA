import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthService from "../../api/auth";
import Background from "../../assets/Green Banana Leaf Pattern Reminder Facebook Post(1).jpg";
import LOGO from "../../assets/logo.png";
import Button from "../fields/Button";
import { login, setUserData } from "../../store/userSlice";
import { connectSocket } from "../../socket";

const OTPVerification = () => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [error, setError] = useState<string>("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if challenge token exists
    const token = sessionStorage.getItem("challengeToken");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (element: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (isNaN(Number(element.target.value))) return false;
    const newOtp = [...otp];
    newOtp[index] = element.target.value;
    setOtp(newOtp);

    // Focus next input
    if (element.target.value !== "") {
      if (index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && otp[index] === "") {
      if (index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus on the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5);
    if (inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex]?.focus();
    } else if (inputRefs.current[5]) {
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }
    setError("");

    const challengeToken = sessionStorage.getItem("challengeToken");
    if (!challengeToken) {
      navigate("/");
      return;
    }

    try {
      const response = await AuthService.verifyChallenge({
        otp: otpValue,
        challengeToken
      });
      
      const token = response?.data?.token || response?.token;
      const userDetail = response?.data?.user || response?.user;

      if (!token) {
        throw new Error("Invalid Credentials: Token not found in response");
      }

      sessionStorage.removeItem("challengeToken");
      sessionStorage.setItem("token", token);
      connectSocket(token);
      const role = userDetail?.role || userDetail?.userRole || response?.data?.role || response?.data?.userRole || response?.role;
      if (role) {
        sessionStorage.setItem("userRole", role);
      } else {
        console.warn("User role not found in response", response);
      }

      dispatch(login(token));
      if (userDetail) {
        dispatch(setUserData(userDetail));
      }

      navigate("/dashboard");
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err.message ||
        "Verification failed. Please try again.";
      setError(errorMessage);
    }
  };

  return (
    <div className="relative" style={{ textTransform: 'none' }}>
      <img
        src={Background}
        alt="background"
        className="absolute inset-0 h-full w-full object-cover blur-sm z-0"
      />

      <div className="relative z-10 grid w-screen min-h-screen grid-cols-1 md:grid-cols-2 overflow-x-hidden">
        <div className="flex items-center justify-center md:min-h-screen">
          <div className="flex items-center justify-center p-6 md:p-16 shadow-2xl shadow-green-950/20 bg-white/90 backdrop-blur-sm border-4 border-white rounded-[6px] mx-6 md:mx-20">
            <img src={LOGO} alt="Logo" className="max-w-[220px] md:max-w-md w-full h-auto" />
          </div>
        </div>

        <div className="flex items-center md:backdrop-blur-xl justify-center p-6 md:p-0">
          <div className="bg-white/95 h-fit w-full max-w-lg md:w-3/4 lg:w-2/3 rounded-[6px] border border-green-900/10 p-8 md:p-12 shadow-2xl shadow-green-950/20">
            <div className="mb-8">
              <p className="text-center text-3xl md:text-4xl text-gray-700 font-light leading-tight">
                OTP <span className=" text-green-700">Verification</span>
              </p>
              <p className="text-center text-sm md:text-base text-gray-500 mt-4">
                A verification challenge has been sent to your registered email address.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col w-full gap-6">
              <div className="flex justify-between gap-2">
                {otp.map((data, index) => (
                  <input
                    className="w-10 h-12 md:w-12 md:h-14 text-center text-xl font-semibold border border-gray-300 rounded-[6px] focus:border-green-600 focus:ring-green-600 outline-none"
                    type="text"
                    name="otp"
                    maxLength={1}
                    key={index}
                    value={data}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    ref={(el) => { inputRefs.current[index] = el; }}
                  />
                ))}
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <div className="mt-4">
                <Button type="submit" className="w-full text-xl text-black border border-black bg-green-50 hover:bg-green-100 transition-all duration-300 ">
                  Verify
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
