import { BlogModel } from "../models/BlogModel";
import { BlogService } from "../services/BlogService";
import { HomeView } from "../views/HomeView";

export class HomeController {
  private blogService: BlogService;
  private homeView: HomeView;

  constructor() {
    this.blogService = new BlogService();
    this.homeView = new HomeView();
  }

  async HomePage(): Promise<string> {
    const latestBlogs = await this.blogService.getLatestBlogs();
    const trendingBlogs = await this.blogService.getTrendingBlogs();
    return await this.homeView.render({
      latestBlogs,
      trendingBlogs,
    });
  }

  AboutPage(): string {
    return "about";
  }

  async BlogDetailPage(id: string): Promise<string> {
    const blogDetail = await this.blogService.getBlogById(id);

    if (!blogDetail) {
      return `<h1>Blog not found</h1>`;
    }

    return this.homeView.renderDetail(blogDetail);
  }
}
