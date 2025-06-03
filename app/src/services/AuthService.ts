import axios from "axios";
import { AuthModel, type AuthParams } from "../models/AuthModel";

export class AuthService {
  async login(formData: Record<string, string>): Promise<AuthModel> {
    const res = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/login", formData);
    return new AuthModel(res.data);
  }

  async register(formData: Record<string, string>): Promise<AuthModel> {
    const res = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/register", formData);
    return new AuthModel(res.data);
  }

  async forgotPassword(formData: Record<string, string>): Promise<AuthModel> {
    const res = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/forgot-password", formData);
    return new AuthModel(res.data);
  }

  async resetPassword(formData: Record<string, string>): Promise<AuthModel> {
    const res = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/reset-password", formData);
    return new AuthModel(res.data);
  }

  async loginWithGoogle(id_token: string): Promise<AuthModel> {
    const res = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/google-auth", { id_token });
    return new AuthModel(res.data);
  }
}
