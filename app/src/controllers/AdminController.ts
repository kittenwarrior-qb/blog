import { BlogModel } from "../models/BlogModel";
import { BlogService } from "../services/BlogService";
import { AdminView } from "../views/AdminView";

export class AdminController {
  private blogService: BlogService;
  private adminView: AdminView;

  constructor() {
    this.blogService = new BlogService();
    this.adminView = new AdminView();
  }

  async AdminPage(): Promise<string> {
    return this.adminView.AdminPage()
  }

  async AdminBlogPage(): Promise<string> {
    const latestBlogs = await this.blogService.getLatestBlogs();
    return this.adminView.AdminBlogPage(latestBlogs);
  }

  // async initAdminEvents(): {
    
  // }
  
}
