import { MainService } from "./MainService";
import { BlogModel, type BlogParams } from "../models/BlogModel";
import toast from "../libs/toast";
import { AppContext } from "../models/ContextModel";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export class BlogService extends MainService {

  validateBlogInput(blogData: BlogParams, isDraft = false): string | null {
    if (!blogData.title) return "Tiêu đề không được để trống.";

    if (!isDraft) {
      if (!blogData.des) return "Mô tả không được để trống.";
      if (blogData.des.length > 200) return "Mô tả quá dài (tối đa 200 ký tự).";
      if (!blogData.tags || blogData.tags.length === 0) return "Phải chọn ít nhất một thẻ.";
    }

    if (
      !blogData.content ||
      typeof blogData.content !== "object" ||
      !Array.isArray(blogData.content.blocks) ||
      blogData.content.blocks.length === 0
    ) return "Nội dung blog không được để trống.";

    return null;
  }


  async getBlogsByTags(tag: string): Promise<BlogModel[]> {
    const data = await this.post<{ blogs: BlogParams[] }>("/search-blogs", { tag });
    return data.blogs.map((b) => new BlogModel(b));
  }

  async getLatestBlogs(): Promise<BlogModel[]> {
    const data = await this.get<{ blogs: BlogParams[] }>("/latest-blogs");
    return data.blogs.map((b) => new BlogModel(b));
  }

  async getTrendingBlogs(): Promise<BlogModel[]> {
    const data = await this.get<{ blogs: BlogParams[] }>("/trending-blogs");
    return data.blogs.map((b) => new BlogModel(b));
  }

  async getBlogById(id: string): Promise<BlogModel | null> {
    try {
      const data = await this.post<{ blog: BlogParams }>('/get-blog', { blog_id: id, draft: true });

      if (!data.blog) return null;

      return new BlogModel(data.blog);
    } catch (error) {
      console.error("Lỗi khi lấy blog:", error);
      return null;
    }
  }


  async create(blog: BlogModel): Promise<ApiResponse<BlogModel>> {
    const {title, banner, des, content, tags, draft} = blog
    try {
      const data = await this.post<BlogParams>("/create-blog", { title, banner, des, content, tags, draft});
      return { success: true, data: new BlogModel(data) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async update(id: string, blog: BlogModel): Promise<ApiResponse<BlogModel>> {
    try {
      const data = await this.put<BlogParams>(`/blog/${id}`, blog);
      return { success: true, data: new BlogModel(data) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async deleteById(id: string): Promise<ApiResponse<null>> {
    try {
      await super.delete(`/blog/${id}`);
      return { success: true, data: null };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async saveOrPublish(blogData: BlogParams, draft: boolean): Promise<ApiResponse<BlogModel>> {
    const validationError = this.validateBlogInput(blogData, draft);
    if (validationError) {
      toast.error(validationError);
      return { success: false, error: validationError };
    }

    const normalizedContent = Array.isArray(blogData.content)
      ? { blocks: blogData.content }
      : blogData.content;

    const blog = new BlogModel({
      ...blogData,
      content: normalizedContent,
      draft,
    });

    try {
      const data = await this.post<BlogParams>("/create-blog", blog);
      toast.success(draft ? "Bản nháp đã được lưu!" : "Blog đã được đăng!");
      AppContext.resetBlog();
      window.location.href = "/";
      return { success: true, data: new BlogModel(data) };
    } catch (error) {
      const msg = (error as Error).message;
      toast.error("Không thể lưu blog: " + msg);
      return { success: false, error: msg };
    }
  }

  async saveDraft(blogData: BlogParams): Promise<ApiResponse<BlogModel>> {
    const validationError = this.validateBlogInput(blogData, true);
    if (validationError) {
      toast.error(validationError);
      return { success: false, error: validationError };
    }

    const normalizedContent = Array.isArray(blogData.content)
      ? { blocks: blogData.content }
      : blogData.content;

    const blog = new BlogModel({
      ...blogData,
      content: normalizedContent,
      draft: true,
    });

    try {
      const data = await this.post<BlogParams>("/create-blog", blog);
      toast.success("Bản nháp đã được lưu!");
      return { success: true, data: new BlogModel(data) };
    } catch (error) {
      const msg = (error as Error).message;
      toast.error("Không thể lưu bản nháp: " + msg);
      return { success: false, error: msg };
    }
  }

  async publish(blogData: BlogParams): Promise<ApiResponse<BlogModel>> {
    const validationError = this.validateBlogInput(blogData, false);
    if (validationError) {
      toast.error(validationError);
      return { success: false, error: validationError };
    }

    const normalizedContent = Array.isArray(blogData.content)
      ? { blocks: blogData.content }
      : blogData.content;

    const blog = new BlogModel({
      ...blogData,
      content: normalizedContent,
      draft: false,
    });

    try {
      const data = await this.post<BlogParams>("/create-blog", blog);
      toast.success("Blog đã được đăng!");
      AppContext.resetBlog();
      window.location.href = "/";
      return { success: true, data: new BlogModel(data) };
    } catch (error) {
      const msg = (error as Error).message;
      toast.error("Không thể đăng blog: " + msg);
      return { success: false, error: msg };
    }
  }
}
