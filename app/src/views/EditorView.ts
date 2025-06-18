import { AnimationWrapper } from "../libs/gsapAnimation";
import { uploadImage } from "../libs/cloudinary";
import blog_banner from "../img/blog_banner.png";
import { AppContext } from "../models/ContextModel";
import EditorJS from "@editorjs/editorjs";
import { editorTools } from "../libs/editorTools";
import type { OutputData } from "@editorjs/editorjs";
import { Tag } from "../components/tag";
import toast from "../libs/toast";
import { BlogService } from "../services/BlogService";

declare global {
  interface Window {
    handleBannerUpload?: (event: Event) => void;
    handleTitleKeyDown?: (event: Event) => void;
    handleTitleChange?: (event: Event) => void;
    handlePublish?: (event: Event) => void;
    handleCloseEvent?: (event: Event) => void;
    handleDesChange?: (event: Event) => void;
    handleTagKeyDown?: (event: KeyboardEvent) => void;
    handleTagDelete?: (index: number) => void;
  }
}

export class EditorView {
  private editor?: EditorJS;
  private editorState: "editor" | "publish" = "editor";

  public setEditorState(state: "editor" | "publish") {
    this.editorState = state;
  }

  constructor() {
    this.assignHandler("handleBannerUpload", this.handleBannerUpload);
    this.assignHandler("handleTitleKeyDown", this.handleTitleKeyDown);
    this.assignHandler("handleTitleChange", this.handleTitleChange);
    this.assignHandler("handlePublish", this.handlePublish);
    this.assignHandler("handleCloseEvent", this.handleCloseEvent);
    this.assignHandler("handleDesChange", this.handleDesChange);
    this.assignHandler(
      "handleTagKeyDown",
      this.handleTagKeyDown as unknown as (event: Event) => void
    );
  }

  private assignHandler(
    name: keyof Window,
    handler: (event: Event) => void
  ): void {
    if (!window[name]) {
      (window[name] as typeof handler) = handler.bind(this);
    }
  }

  private handleTagKeyDown(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    if (event.key === "Enter") {
      event.preventDefault();
      const newTag = input.value.trim();

      if (!AppContext.blog.tags) {
        AppContext.setBlogField("tags", []);
      }

      if (AppContext.blog.tags.includes(newTag)) {
        toast.error("Tag already exists.");
        return;
      }

      if (AppContext.blog.tags.length >= 10) {
        toast.error("You can only add up to 10 tags.");
        return;
      }

      if (newTag) {
        const newTags = [...(AppContext.blog.tags || []), newTag];
        AppContext.setBlogField("tags", newTags);
        input.value = "";
        this.updateTagList();
      }
    }
  }

  private bindTagDeleteEvents() {
    const tagContainer = document.querySelector(".tag-container");
    if (!tagContainer) return;

    tagContainer.replaceWith(tagContainer.cloneNode(true));

    const newTagContainer = document.querySelector(".tag-container");
    if (!newTagContainer) return;

    newTagContainer.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("tag-delete-btn")) {
        const tagElements = Array.from(
          newTagContainer.querySelectorAll(".tag-item")
        );
        const tagItem = target.closest(".tag-item");
        if (!tagItem) return;
        const index = tagElements.indexOf(tagItem as Element);
        if (index >= 0) {
          const newTags = [...AppContext.blog.tags];
          newTags.splice(index, 1);
          AppContext.setBlogField("tags", newTags);
          this.updateTagList();
        }
        console.log("tagElements:", tagElements);
        console.log("tagItem:", tagItem);
        console.log("index:", index);
      }
    });
  }

  public updateTagList() {
    const tagContainer = document.querySelector(".tag-container");
    if (tagContainer) {
      tagContainer.innerHTML = AppContext.blog.tags
        .map((tag) => Tag(tag))
        .join("");
      this.bindTagDeleteEvents();
    }
    const tagCounter = document.getElementById("tagCounter");
    if (tagCounter) {
      tagCounter.textContent = `${10 - AppContext.blog.tags.length} tags left`;
    }
  }

  public initEditor() {
    if (this.editor) return;

    const holderElement = document.getElementById("textEditor");
    if (!holderElement) {
      console.warn("Holder element #textEditor not found. Waiting for DOM...");
      return;
    }

    let dataToLoad: OutputData = {
      time: Date.now(),
      blocks: [],
    };

    const contentRaw = AppContext.blog.content;

    // Xử lý nếu content bị trả về là mảng
    const contentObj: OutputData | null = Array.isArray(contentRaw)
      ? (contentRaw[0] as OutputData)
      : (contentRaw as OutputData);

    if (
      contentObj &&
      typeof contentObj === "object" &&
      Array.isArray(contentObj.blocks)
    ) {
      dataToLoad = contentObj;
    }

    this.editor = new EditorJS({
      holder: "textEditor",
      data: dataToLoad,
      tools: editorTools,
      placeholder: "Let's write awesome story",
      onChange: async () => {
        const savedData = await this.editor?.save();
        if (savedData) {
          AppContext.setBlogField("content", savedData);
        }
      },
    });
  }

  private async handlePublish() {
    if (!AppContext.blog.banner) {
      toast.error("Upload a blog banner to publish it");
      return;
    }

    if (!AppContext.blog.title) {
      toast.error("Write a title to publish it");
      return;
    }

    if (!this.editor) {
      toast.error("Editor not initialized");
      return;
    }

    try {
      await this.editor.isReady;
      const data = await this.editor.save();

      if (!data.blocks.length) {
        toast.error("Write some content before publishing");
        return;
      }

      AppContext.setBlogField("content", data);
      toast.success("Blog saved! Ready to publish.");
      this.editorState = "publish";
      window.location.hash = "/publish";
    } catch (error) {
      console.error("Failed to save blog content:", error);
      toast.error("An error occurred while saving blog content.");
    }
  }

  private async handleCloseEvent() {
    this.editorState = "editor";
    window.location.hash = "/editor";
  }

  private async handleTitleChange(event: Event) {
    const input = event.target as HTMLTextAreaElement | HTMLInputElement;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";

    AppContext.setBlogField("title", input.value);
    this.updateTitleName();
  }

  private async handleDesChange(event: Event) {
    const input = event.target as HTMLTextAreaElement | HTMLInputElement;

    AppContext.setBlogField("des", input.value);
    this.updateDescription();
  }

  private updateDescription() {
    const des = document.getElementById("des");
    const desValid = document.getElementById("desValidate");
    const desText = AppContext.blog.des?.trim() || "";

    if (des) {
      des.textContent = desText;
    }

    if (desValid) {
      desValid.textContent = `${200 - desText.length} characters left`;
    }
  }

  private updateTitleName() {
    const titleName = document.getElementById("titleName");
    if (titleName) {
      titleName.textContent = AppContext.blog.title.trim() || "New blog";
    }
  }
  private async handleTitleKeyDown(event: Event) {
    console.log(event);
  }

  private async handleBannerUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const img = input.files?.[0];
    if (!img) return;

    toast.loading("Uploading image...");

    try {
      const uploadedUrl = await uploadImage(img);
      toast.dismissLoading();

      if (uploadedUrl) {
        const bannerImage = document.getElementById(
          "bannerImg"
        ) as HTMLImageElement | null;
        if (bannerImage) bannerImage.src = uploadedUrl;

        AppContext.setBlogField("banner", uploadedUrl);
        toast.success("Banner uploaded successfully!");
      } else {
        toast.error("Failed to upload banner image.");
      }
    } catch (error) {
      toast.dismissLoading();
      toast.error("An error occurred during upload.");
      console.error(error);
    }
  }
  // __________________________________________Render here__________________________________________

  public render(): string {
    const isLoggedIn = !!AppContext.user.accessToken;

    if (!isLoggedIn) {
      toast.error("You must be logged in to write a blog");
      window.location.hash = "/login";
      return "";
    }

    const editorState = this.editorState;

    const navHtml = this.renderNavbar();
    let contentHtml = "";

    if (editorState === "editor") {
      contentHtml = this.renderBlogEditor();
    } else if (editorState === "publish") {
      contentHtml = this.renderPublishForm();
      return AnimationWrapper({
        children: contentHtml,
        fromY: 30,
        toY: 0,
        duration: 0.5,
      });
    } else {
      contentHtml = this.renderBlogEditor();
    }

    return (
      navHtml +
      AnimationWrapper({
        children: contentHtml,
        fromY: 30,
        toY: 0,
        duration: 0.5,
      })
    );
  }

  public renderNavbar(): string {
    return `
      <nav class="navbar">
        <div class="pr-10 flex gap-10 items-center justify-center">
          <a class="font-gelasio font-semibold text-xl" href="#/">
            Vietnews
          </a>
          <p id="titleName" class="max-md:hidden line-clamp-1 text-center w-full">
            ${AppContext.blog.title || "New blog"}
          </p>
        </div>

        <div class="flex gap-4 ml-auto">
          <button class="btn-dark" onclick="handlePublish()">Publish</button>
          <button id="btn-draft" class="btn-light">Save Draft</button>
        </div>
      </nav>
    `;
  }

  public renderBlogEditor(): string {
    const blog = AppContext.blog;

    return `
      <section>
        <div class="mx-auto max-w-[900px] w-full">
          <div class="relative aspect-video hover:opacity-80 bg-white border-4 border-gray-50">
            <label for="uploadBanner">
              <img
                src="${blog.banner || blog_banner}"
                alt="Banner"
                class="object-cover w-full h-full"
                id="bannerImg"
              />
              <input 
                id="uploadBanner"
                type="file"
                accept=".png, .jpg, .jpeg"
                hidden
                onchange="handleBannerUpload(event)"
              />
            </label>
          </div>

          <textarea 
            placeholder="Blog Title"
            class="!text-3xl font-medium w-full h-20 outline-none rezise-none !mt-10 leading-tight placeholder:opacity-60"
            onKeyDown="handleTitleKeyDown(event)"
            oninput="handleTitleChange(event)"
          >${blog.title || ""}</textarea>

          <hr class="w-full opacity-10 my-5" />
          <div id="textEditor" class="font-gelasio"></div>
        </div>
      </section>
    `;
  }

  public initEditorEvents() {
    const blogService = new BlogService();
    const publishBtn = document.querySelector("#btn-publish");
    const draftBtn = document.querySelector("#btn-draft");

    if (publishBtn) {
      publishBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const blogData = AppContext.blog;

        try {
          blogData.draft = false;

          if (blogData.blog_id) {
            const result = await blogService.updateBlog(
              blogData.blog_id,
              blogData
            );
            if (result.success) {
              toast.success("Blog đã được cập nhật thành công!");
              AppContext.resetBlog();
              window.location.href = "/";
            } else {
              toast.error("error: " + result.error);
            }
          } else {
            const result = await blogService.saveOrPublish(blogData, false);
            if (result.success) {
              AppContext.resetBlog();
              window.location.href = "/";
            } else {
              toast.error("error: " + result.error);
            }
          }
        } catch (err) {
          console.error("Lỗi khi publish:", err);
          toast.error("Đã xảy ra lỗi khi publish blog.");
        }
      });
    }

    if (draftBtn) {
      draftBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const blogData = AppContext.blog;

        try {
          await blogService.saveOrPublish(blogData, true); // lưu bản nháp
          alert("Đã lưu bản nháp!");
        } catch (err) {
          console.error("Lỗi khi lưu bản nháp:", err);
          alert("Không thể lưu bản nháp.");
        }
      });
    }
  }

  public renderPublishForm(): string {
    const blog = AppContext.blog;
    console.log(blog);

    if (!blog.title || !blog.banner || !blog.content) {
      return `
        <section class="max-w-xl mx-auto text-center py-20">
          <p class="mb-6">You must create a blog first.</p>
        </section>
      `;
    }

    return `
      <section class="w-full min-h-screen grid items-center lg:grid-cols-2 !py-16">
        <button class="w-12 h-12 absolute right-[5vw] z-10 top-5 lg:top-10"
          onClick="handleCloseEvent()"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="max-w-[550px] center">
          <p class="text-gray-600 !mb-1">Preview</p>

          <div class="w-full aspect-video rounded-lg overflow-hidden bg-gray-50 mt-4">
            <img src="${blog.banner}" />
          </div>

          <h1 id="titleName" class="text-2xl font-medium !mt-4  leading-tight line-clamp-2">
            ${blog.title}
          </h1>

          <p id="des" class="font-gelasio line-clamp-2 text-xl leading-7 !mt-4">
            ${blog.des}
          </p>
        </div>

        <div class="border-gray-50 lg:border-1 lg:!pl-20">
          <p class="text-gray-600 !mb-3 !mt-9">Blog Title</p>
          <input 
            type="text" 
            placeholder="Blog Title" 
            class="input-box !pl-4" 
            value="${blog.title || ""}" 
            oninput="handleTitleChange(event)" 
          />

          <p class="text-gray-600 !mb-3 !mt-9">Short description about your blog</p>
          
          <textarea
            maxLength="200"
            class="h-40 resize-none leading-7 input-box !pl-4"
            onInput="handleDesChange(event)"
          >${blog.des || ""}</textarea>

          <p id="desValidate" class="!mt-1 text-gray-600 text-sm text-right">${
            200 - (blog.des?.length || 0)
          } characters left</p>

          <div class="relative input-box !pl-2 !py !pb-4 !mt-9">
            <input type="text" placeholder="Tag" class="sticky input-box !bg-white top-0 left-0 !pl-4 !mb-3 !focus:bg-white" onKeyDown="handleTagKeyDown(event)" />
            <div class="tag-container">
              ${(AppContext.blog.tags || [])
                .map((tag: string) => Tag(tag))
                .join("")}
            </div>
          </div>
          <p id="tagCounter" class="!mt-1 text-gray-600 text-sm text-right" >${
            10 - AppContext.blog.tags.length
          } tags left</p>

          <button id="btn-publish" class="btn-dark !px-8">
            Publish
          </button>

        </div>
      </section>
    `;
  }
}
