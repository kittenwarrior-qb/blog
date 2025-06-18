import { MainService } from "./MainService";
import { UserModel, type UserParams } from "../models/UserModel";
import toast from "../libs/toast";
import { AxiosError } from "axios";

export class UserService extends MainService {
  async getProfile(name: string): Promise<UserModel> {
    try {
      const url =
        import.meta.env.VITE_SERVER_DOMAIN +
        "/get-profile?username=" +
        encodeURIComponent(name);

      const res = await this.get<UserParams>(url);
      return new UserModel(res);
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw new Error("Failed to fetch profile");
    }
  }

  async getAllUsers(
    params: { page?: number; limit?: number; search?: string } = {}
  ): Promise<{
    users: UserModel[];
    pagination: {
      totalUsers: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  }> {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.limit) query.append("limit", params.limit.toString());
    if (params.search) query.append("search", params.search);

    try {
      const data = await this.get<{
        users: UserParams[];
        pagination: {
          totalUsers: number;
          totalPages: number;
          currentPage: number;
          limit: number;
        };
      }>(`/get-all-users?${query.toString()}`);

      return {
        users: data.users.map((u) => new UserModel(u)),
        pagination: data.pagination,
      };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const message = error?.response?.data?.message || "Something went wrong";
      toast.error(message);
      return {
        users: [],
        pagination: {
          totalUsers: 0,
          totalPages: 0,
          currentPage: params.page || 1,
          limit: params.limit || 5,
        },
      };
    }
  }
}
