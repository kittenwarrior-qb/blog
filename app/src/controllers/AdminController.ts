import { UserService } from "./../services/UserService";
import { BlogService } from "../services/BlogService";
import { AdminView } from "../views/AdminView";
import { SessionModel } from "../models/SessionModel";
import { AppContext } from "../models/ContextModel";
import { uploadImage } from "../libs/cloudinary";
import axios from "axios";
import toast from "../libs/toast";

export class AdminController {
  private blogService: BlogService;
  private adminView: AdminView;
  private userService: UserService;

  constructor() {
    this.blogService = new BlogService();
    this.adminView = new AdminView();
    this.userService = new UserService();
  }

  async AdminPage(): Promise<string> {
    const hash = window.location.hash;
    const queryIndex = hash.indexOf("?");
    const queryString = queryIndex >= 0 ? hash.substring(queryIndex) : "";
    const urlParams = new URLSearchParams(queryString);
    const search = urlParams.get("search") || "";

    const blogs = await this.blogService.getAllBlogs({
      page: 1,
      tag: "",
      search: "",
    });

    const users = await this.userService.getAllUsers({
      page: 1,
      search: "",
    });

    console.log("Blogs:", blogs);

    const total_blogs = blogs.pagination.totalBlogs;
    const total_users = users.pagination.totalUsers;

    return this.adminView.AdminDashBoard(total_blogs, total_users, search);
  }

  async AdminBlogPage(): Promise<string> {
    const hash = window.location.hash;
    const queryIndex = hash.indexOf("?");
    const queryString = queryIndex >= 0 ? hash.substring(queryIndex) : "";
    const urlParams = new URLSearchParams(queryString);

    const page = parseInt(urlParams.get("page") || "1");
    const tag = urlParams.get("tag") || "";
    const search = urlParams.get("search") || "";

    const { blogs, pagination } = await this.blogService.getAllBlogs({
      page,
      tag,
      search,
    });

    return this.adminView.AdminBlogPage(blogs, pagination, tag, search);
  }

  async EditBlogPage(blogId: string): Promise<string> {
    const blog = await this.blogService.getBlogById(blogId);
    if (!blog) {
      return `<div class="">Blog not found</div>`;
    }

    return this.adminView.AdminBlogEditForm(blog);
  }
  async DeleteBlog(blogId: string): Promise<boolean> {
    const res = await this.blogService.deleteById(blogId);
    return res.success;
  }

  paginationEvent() {
    this.adminView.afterRender();
  }

  initAdminBlogPage() {
    this.adminView.initBlogPageEvents(
      async (id) => {
        const html = await this.EditBlogPage(id);
        console.log("onEdit called with id:", id);

        const main = document.getElementById("admin-main-content");
        if (main) {
          main.innerHTML = html;
          this.initEditBlogEvents();
        }
      },
      async (id) => {
        if (confirm("Are you sure to delete?")) {
          const success = await this.DeleteBlog(id);
          if (success) {
            toast.success("Blog deleted");
            window.location.reload();
          } else toast.error("Failed to delete");
        }
      }
    );
  }

  initEditBlogEvents() {
    const form = document.querySelector("#edit-blog-form") as HTMLFormElement;
    if (!form) return;

    const bannerFileInput = document.getElementById(
      "banner-file-input"
    ) as HTMLInputElement;
    const bannerHiddenInput = document.getElementById(
      "banner"
    ) as HTMLInputElement;
    const bannerPreviewImg = document.getElementById(
      "banner-preview"
    ) as HTMLImageElement;

    if (bannerFileInput) {
      bannerFileInput.addEventListener("change", async () => {
        const file = bannerFileInput.files?.[0];
        if (file) {
          try {
            toast.loading("Uploading banner...");
            const uploadedUrl = await uploadImage(file);
            toast.dismissLoading();

            if (!uploadedUrl) {
              toast.error("Failed to upload banner image.");
              return;
            }

            bannerHiddenInput.value = uploadedUrl;
            bannerPreviewImg.src = uploadedUrl;
            toast.success("Banner uploaded successfully!");
          } catch (err) {
            toast.dismissLoading();
            toast.error("An error occurred while uploading the banner.");
            console.error(err);
          }
        }
      });
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const blogId = form.dataset.blogId!;
      const bannerUrl = formData.get("banner") as string;

      const blogData = {
        title: formData.get("title") as string,
        banner: bannerUrl,
        des: formData.get("des") as string,
        tags:
          formData
            .get("tags")
            ?.toString()
            .split(",")
            .map((tag) => tag.trim()) || [],
        draft: formData.get("draft") === "on",
      };

      try {
        toast.loading("Updating blog...");
        const result = await this.blogService.updateBlog(blogId, blogData);
        toast.dismissLoading();

        if (result.success) {
          toast.success("Blog updated successfully!");
          window.location.reload();
        } else {
          toast.error("Failed to update the blog.");
        }
      } catch (err) {
        toast.dismissLoading();
        toast.error("An error occurred while updating the blog.");
        console.error(err);
      }
    });

    const backBtn = document.getElementById("btn-back");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        window.location.reload();
      });
    }
  }

  public initLogoutBtn() {
    const logoutBtn = document.querySelector(
      "#logoutBtn"
    ) as HTMLButtonElement | null;
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", async () => {
      try {
        const res = await axios.delete(
          import.meta.env.VITE_SERVER_DOMAIN + "/logout"
        );

        SessionModel.remove("user");
        AppContext.setAccessToken(null);
        AppContext.setProfileImg(null);
        AppContext.setUsername(null);

        toast.success(res.data.msg || "Logout successful!");
      } catch (err: any) {
        toast.error(err.response?.data?.msg || "Logout failed!");
      } finally {
        window.location.hash = "#/login";
      }
    });
  }
}
