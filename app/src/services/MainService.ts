import axios from "axios";
import { AppContext } from "../models/ContextModel";

const instance = axios.create({
  baseURL: "http://localhost:3000",
});

instance.interceptors.request.use((config) => {
  const token = AppContext.user?.accessToken;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class MainService {
  async get<T = any>(url: string): Promise<T> {
    try {
      const response = await instance({
        method: "GET",
        url,
      });
      return response.data as T;
    } catch (error) {
      throw error;
    }
  }

  async post<T = any, U = any>(url: string, data: U): Promise<T> {
    try {
      const response = await instance({
        method: "POST",
        url,
        data,
      });
      return response.data as T;
    } catch (error) {
      throw error;
    }
  }

  async put<T = any, U = any>(url: string, data: U): Promise<T> {
    try {
      const response = await instance({
        method: "PUT",
        url,
        data,
      });
      return response.data as T;
    } catch (error) {
      throw error;
    }
  }

  async delete<T = any>(url: string): Promise<T> {
    try {
      const response = await instance({
        method: "DELETE",
        url,
      });
      return response.data as T;
    } catch (error) {
      throw error;
    }
  }
}
