import axios from "axios";
import { AuthModel, type AuthParams } from "../models/AuthModel";
import { MainService } from "./MainService";

export class AuthService extends MainService {
  async login(
    formData: Record<string, string>
  ): Promise<{ msg: string; data: AuthParams }> {
    const res = await this.post<
      { msg: string; data: AuthParams },
      Record<string, string>
    >(import.meta.env.VITE_SERVER_DOMAIN + "/login", formData);
    return res;
  }

  async register(
    formData: Record<string, string>
  ): Promise<{ msg: string; data: AuthParams }> {
    const res = await this.post<
      { msg: string; data: AuthParams },
      Record<string, string>
    >(import.meta.env.VITE_SERVER_DOMAIN + "/register", formData);
    return res;
  }

  async forgotPassword(formData: Record<string, string>): Promise<AuthModel> {
    const res = await axios.post(
      import.meta.env.VITE_SERVER_DOMAIN + "/forgot-password",
      formData
    );
    return new AuthModel(res.data);
  }

  async resetPassword(formData: Record<string, string>): Promise<AuthModel> {
    const res = await axios.post(
      import.meta.env.VITE_SERVER_DOMAIN + "/reset-password",
      formData
    );
    return new AuthModel(res.data);
  }

  async loginWithGoogle(
    id_token: string
  ): Promise<{ msg: string; data: AuthParams }> {
    return this.post(
      "/google-auth",
      { id_token },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
