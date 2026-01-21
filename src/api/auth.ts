import type { AuthInterface, ChangePasswordPayload } from "../interface/index";
import api from "./api";

class AuthService {
  static async login({ username, password }: AuthInterface) {
    const userData = {
      username: username.toUpperCase(),
      password,
    };

    console.log("Sending login request with payload:", userData);

    try {
      const response = await api.post(`auth/login`, userData);
      console.log("response of Sign-in:-", response);
      return response?.data;
    } catch (error: any) {
      console.error(
        "Error while sign-in:",
        error?.response?.data || error.message || error
      );
      throw error;
    }
  }
  // change password
  static async changePassword({ id, token, newPassword }: ChangePasswordPayload) {
    const userData = {
      id,
      token,
      newPassword,
    };

    console.log("Sending login request with payload:", userData);

    try {
      const response = await api.patch(`auth/reset-password`, userData);
      console.log("response of Sign-in:-", response);
      return response?.data;
    } catch (error: any) {
      console.error(
        "Error while sign-in:",
        error?.response?.data || error.message || error
      );
      throw error;
    }
  }
}

export default AuthService;
