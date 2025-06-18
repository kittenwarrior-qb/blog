import { BlogService } from "./../services/BlogService";
import { EditorView } from "../views/EditorView";
import { AppContext } from "../models/ContextModel";

export class EditorController {
  private editorView: EditorView;
  private blogService: BlogService;

  constructor() {
    this.editorView = new EditorView();
    this.blogService = new BlogService();
  }

  async EditorPage(id?: string): Promise<string> {
    console.log(AppContext.user);
    console.log(AppContext.blog);

    if (!sessionStorage.getItem("editor_reloaded")) {
      sessionStorage.setItem("editor_reloaded", "true");
      location.reload();
      return "";
    }
    sessionStorage.removeItem("editor_reloaded");

    if (!id) {
      AppContext.resetBlog();
      return this.editorView.render();
    }
    try {
      const blogData = await this.blogService.getBlogById(id);
      if (!blogData) return `<h1>Blog không tồn tại</h1>`;

      AppContext.setBlog({
        blog_id: blogData.blog_id,
        title: blogData.title || "",
        banner: blogData.banner || "",
        content: blogData.content || { blocks: [] },
        tags: blogData.tags || [],
        des: blogData.des || "",
        author: blogData.author || { personal_info: {} },
        draft: blogData.draft ?? true,
      });

      return this.editorView.render();
    } catch (err) {
      console.error("Lỗi khi load blog để edit:", err);
      return `<h1>Có lỗi xảy ra khi tải bài viết.</h1>`;
    }
  }

  async PublishPage(): Promise<string> {
    return this.editorView.render();
  }

  async initEditor() {
    this.editorView.initEditor();
    this.editorView.initEditorEvents();
  }

  async initPublish() {
    this.editorView.initEditorEvents();
  }
}
