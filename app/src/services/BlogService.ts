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
      if (!blogData.tags || blogData.tags.length === 0)
        return "Phải chọn ít nhất một thẻ.";
    }

    if (
      !blogData.content ||
      typeof blogData.content !== "object" ||
      !Array.isArray(blogData.content.blocks) ||
      blogData.content.blocks.length === 0
    )
      return "Nội dung blog không được để trống.";

    return null;
  }

  async getBlogsByUsername(username: string): Promise<BlogModel[]> {
    try {
      const data = await this.get<{
        msg: string;
        data: BlogParams[];
        page: number;
        totalPages: number;
      }>("/get-by-username", {
        params: { username },
      });

      if (!data?.data || !Array.isArray(data.data)) {
        console.warn("API không trả về blog hợp lệ:", data);
        return [];
      }

      return data.data.map((blog) => new BlogModel(blog));
    } catch (error) {
      console.error("Lỗi khi lấy blog theo username:", error);
      return [];
    }
  }

  async getDraftByUsername(username: string): Promise<BlogModel[]> {
    try {
      const data = await this.get<{
        msg: string;
        data: BlogParams[];
        page: number;
        totalPages: number;
      }>("/get-drafts-by-username", {
        params: { username },
      });

      if (!data?.data || !Array.isArray(data.data)) {
        console.warn("API không trả về blog hợp lệ:", data);
        return [];
      }

      return data.data.map((blog) => new BlogModel(blog));
    } catch (error) {
      console.error("Lỗi khi lấy blog theo username:", error);
      return [];
    }
  }

  async getBlogsByTags(tag: string): Promise<BlogModel[]> {
    const data = await this.post<{ blogs: BlogParams[] }, { tag: string }>(
      "/search-blogs",
      { tag }
    );
    return data.blogs.map((b) => new BlogModel(b));
  }

  async getAllBlogs(
    params: { page?: number; tag?: string; search?: string } = {}
  ): Promise<{
    blogs: BlogModel[];
    pagination: {
      totalBlogs: number;
      totalPages: number;
      totalViews: number;
      currentPage: number;
      limit: number;
    };
  }> {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.tag) query.append("tag", params.tag);
    if (params.search) query.append("search", params.search);

    const data = await this.get<{
      blogs: BlogParams[];
      pagination: {
        totalBlogs: number;
        totalPages: number;
        totalViews: number;
        currentPage: number;
        limit: number;
      };
    }>(`/get-all-blogs?${query.toString()}`);

    return {
      blogs: data.blogs.map((b) => new BlogModel(b)),
      pagination: data.pagination,
    };
  }

  async getLatestBlogs(params: { page?: number; tag?: string } = {}): Promise<{
    blogs: BlogModel[];
    pagination: {
      totalBlogs: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  }> {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.tag) query.append("tag", params.tag);

    const data = await this.get<{
      blogs: BlogParams[];
      pagination: {
        totalBlogs: number;
        totalPages: number;
        currentPage: number;
        limit: number;
      };
    }>(`/latest-blogs?${query.toString()}`);

    return {
      blogs: data.blogs.map((b) => new BlogModel(b)),
      pagination: data.pagination,
    };
  }

  async getTrendingBlogs(): Promise<BlogModel[]> {
    const data = await this.get<{ blogs: BlogParams[] }>("/trending-blogs");
    return data.blogs.map((b) => new BlogModel(b));
  }

  async getBlogById(id: string): Promise<BlogModel | null> {
    try {
      const data = await this.post<
        { blog: BlogParams },
        { blog_id: string; draft: boolean }
      >("/get-blog", {
        blog_id: id,
        draft: true,
      });

      if (!data.blog) return null;

      return new BlogModel(data.blog);
    } catch (error) {
      console.error("Lỗi khi lấy blog:", error);
      return null;
    }
  }

  async create(blog: BlogModel): Promise<ApiResponse<BlogModel>> {
    const { title, banner, des, content, tags, draft } = blog;

    try {
      const data = await this.post<BlogParams, Partial<BlogModel>>(
        "/create-blog",
        {
          title,
          banner,
          des,
          content,
          tags,
          draft,
        }
      );

      return { success: true, data: new BlogModel(data) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async updateBlog(
    blog_id: string,
    blog: BlogModel
  ): Promise<ApiResponse<BlogModel>> {
    const { title, banner, des, content, tags, draft } = blog;

    try {
      const data = await this.put<BlogParams, Partial<BlogModel>>(
        `/update-blog/${blog_id}`,
        {
          title,
          banner,
          des,
          content,
          tags,
          draft,
        }
      );

      return { success: true, data: new BlogModel(data) };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async deleteById(blog_id: string): Promise<ApiResponse<null>> {
    try {
      await super.delete(`/delete-blog/${blog_id}`);
      return { success: true, data: null };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message || "Delete failed",
      };
    }
  }

  async saveOrPublish(
    blogData: BlogParams,
    draft: boolean
  ): Promise<ApiResponse<BlogModel>> {
    const validationError = this.validateBlogInput(blogData, draft);
    if (validationError) {
      toast.error(validationError);
      return { success: false, error: validationError };
    }

    const normalizedContent = Array.isArray(blogData.content)
      ? { blocks: blogData.content }
      : blogData.content;

    const payload: BlogModel = new BlogModel({
      ...blogData,
      draft,
      content: normalizedContent,
    });

    try {
      let response: ApiResponse<BlogModel>;

      if (payload.blog_id) {
        // Nếu có blog_id => cập nhật
        response = await this.updateBlog(payload.blog_id, payload);
        toast.success(
          draft ? "Bản nháp đã được cập nhật!" : "Blog đã được cập nhật!"
        );
      } else {
        response = await this.create(payload);
        toast.success(draft ? "Bản nháp đã được lưu!" : "Blog đã được đăng!");
      }

      if (response.success) {
        AppContext.resetBlog();
        window.location.href = "/";
      }

      return response;
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
      const data = await this.post<BlogParams, BlogParams>("/create-blog", {
        blog_id: blog.blog_id,
        title: blog.title!,
        des: blog.des!,
        banner: blog.banner,
        content: blog.content,
        tags: blog.tags,
        draft: blog.draft,
        author: blog.author,
        publishedAt: blog.publishedAt,
        activity: blog.activity,
      });
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

    // Tạo object đúng kiểu BlogParams
    const payload: BlogParams = {
      blog_id: blogData.blog_id,
      title: blogData.title,
      des: blogData.des,
      banner: blogData.banner,
      content: normalizedContent,
      tags: blogData.tags,
      draft: false,
      author: blogData.author,
      activity: blogData.activity,
      publishedAt: blogData.publishedAt,
    };

    try {
      const data = await this.post<BlogParams, BlogParams>(
        "/create-blog",
        payload
      );
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
