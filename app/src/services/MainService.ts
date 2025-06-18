import axios from "axios";
import { AppContext } from "../models/ContextModel";
import type { AxiosRequestConfig } from "axios";

// Tạo một instance của axios
const instance = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true, // Cho phép gửi cookie refreshToken
});

// Interceptor để tự động gắn accessToken vào header
instance.interceptors.request.use((config) => {
  const token = AppContext.user?.accessToken;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor để xử lý khi accessToken hết hạn
instance.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // Nếu lỗi là 401 và chưa retry lần nào
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Gửi request đến refresh-token endpoint để lấy accessToken mới
        const res = await axios.post(
          "http://localhost:3000/refresh-token",
          {},
          { withCredentials: true } // Gửi kèm cookie
        );

        const newAccessToken = res.data.data.accessToken;

        // Cập nhật accessToken mới vào AppContext
        AppContext.setAccessToken(newAccessToken);

        // Cập nhật lại Authorization header và gửi lại request cũ
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return instance(originalRequest);
      } catch (refreshErr) {
        console.error("Refresh token failed:", refreshErr);
        AppContext.setAccessToken(null);
        window.location.hash = "#/login";
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);
export class MainService {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await instance.get<T>(url, {
      withCredentials: true,
      ...config,
    });
    return response.data;
  }

  // Nên để U = T nếu thường giống nhau để không cần truyền 2 kiểu mỗi lần
  async post<T, U = T>(
    url: string,
    data: U,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await instance.post<T>(url, data, {
      withCredentials: true,
      ...config,
    });
    return response.data;
  }

  async put<T, U>(url: string, data: U): Promise<T> {
    const response = await instance.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await instance.delete<T>(url);
    return response.data;
  }
}
