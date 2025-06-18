import { ProfileView } from "../views/ProfileView";
import { HomeView } from "../views/HomeView";
import { BlogService } from "../services/BlogService";
import { UserService } from "../services/UserService";
import { BlogModel } from "../models/BlogModel";
import { AppContext } from "../models/ContextModel";

export class HomeController {
  private profileView: ProfileView;
  private blogService: BlogService;
  private userService: UserService;
  private homeView: HomeView;

  public currentBlog?: BlogModel;

  constructor() {
    this.homeView = new HomeView();
    this.profileView = new ProfileView();
    this.blogService = new BlogService();
    this.userService = new UserService();
  }

  async HomePage(): Promise<string> {
    // Lấy query string từ hash URL
    const hashQuery = location.hash.includes("?")
      ? location.hash.split("?")[1]
      : "";
    const urlParams = new URLSearchParams(hashQuery);

    const page = parseInt(urlParams.get("page") || "1");
    const tag = urlParams.get("tag") || "";

    const { blogs, pagination } = await this.blogService.getLatestBlogs({
      page,
      tag,
    });
    const trendingBlogs = await this.blogService.getTrendingBlogs();

    return await this.homeView.render({
      latestBlogs: blogs,
      trendingBlogs,
    });
  }

  async ProfilePage(username: string): Promise<string> {
    try {
      const userProfile = await this.userService.getProfile(username);
      if (!userProfile) {
        console.log("userProfile not found");
        return `<h1>Người dùng không tồn tại.</h1>`;
      }

      const blogs = await this.blogService.getBlogsByUsername(username);
      const drafts = await this.blogService.getDraftByUsername(username);
      return this.profileView.renderProfile(userProfile, blogs, drafts);
    } catch (error) {
      console.error("Lỗi khi hiển thị trang profile:", error);
      return `<h1>Đã xảy ra lỗi khi tải trang người dùng.</h1>`;
    }
  }

  async EditProfilePage(username: string): Promise<string> {
    try {
      console.log(AppContext.user);

      const currentUser = AppContext.user;

      if (!currentUser || currentUser.username !== username) {
        return `<h1 class="text-center">Bạn không có quyền chỉnh sửa hồ sơ của người khác.</h1>`;
      }

      const userProfile = await this.userService.getProfile(username);
      if (!userProfile) {
        return `<h1 class="text-center">Người dùng không tồn tại.</h1>`;
      }

      return this.profileView.renderEditProfile(userProfile);
    } catch (error) {
      console.error("Lỗi khi hiển thị trang edit profile:", error);
      return `<h1 class="text-center">⚠️ Đã xảy ra lỗi khi tải trang chỉnh sửa hồ sơ.</h1>`;
    }
  }

  async BlogDetailPage(id: string): Promise<string> {
    const blogDetail = await this.blogService.getBlogById(id);

    if (!blogDetail) {
      return `<h1>Blog not found</h1>`;
    }

    this.currentBlog = blogDetail;

    return this.homeView.renderDetail(blogDetail);
  }
}
