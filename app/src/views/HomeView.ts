import {
  type ContentBlock,
  renderContentBlock,
} from "../components/blogblockcontent";
import { BlogModel } from "../models/BlogModel";
import {
  InPageNavigation,
  initInPageNavigation,
} from "../libs/inpagenavigation";
import { AnimationWrapper } from "../libs/gsapAnimation";
import { BlogCard } from "../components/blogcard";
import { MinimalBlogCard } from "../components/minimalblogcard";
import { nodatamessage } from "../components/nodatamessage";
import { BlogService } from "../services/BlogService";

export class HomeView {
  public async render(data: {
    latestBlogs: BlogModel[];
    trendingBlogs: BlogModel[];
  }): Promise<string> {
    const tabs = [
      { label: "Home" },
      { label: "Trending Blogs", hiddenOnDesktop: true },
    ];
    const categories = [
      "travel",
      "celebrities",
      "cooking",
      "programming",
      "phim",
      "game",
    ];

    const renderLatestBlogs =
      data.latestBlogs.length > 0
        ? data.latestBlogs
            .map(
              (blog, i) => `
              <div class="animate-item">
                ${BlogCard({
                  content: {
                    publishedAt: blog.publishedAt ?? "",
                    tags: blog.tags ?? [],
                    title: blog.title ?? "",
                    des: blog.des ?? "",
                    banner: blog.banner ?? "",
                    activity: {
                      total_likes: blog.activity?.total_likes ?? 0,
                    },
                    blog_id: blog.blog_id ?? "",
                  },
                  author: blog.author?.personal_info || {
                    fullname: "Unknown",
                    profile_img: "default.png",
                    username: "anonymous",
                  },
                  index: i,
                })}
              </div>
            `
            )
            .join("")
        : nodatamessage(`No blogs found in latest blogs`);

    const renderMinimalBlogs = (blogs: BlogModel[]) =>
      blogs
        .map(
          (blog, i) => `
          <div class="animate-item">
            ${MinimalBlogCard({
              content: {
                blog_id: blog.blog_id ?? "",
                title: blog.title ?? "",
                publishedAt: blog.publishedAt ?? "",
              },
              author: blog.author?.personal_info || {
                fullname: "Unknown",
                profile_img: "default.png",
                username: "anonymous",
              },
              index: i,
            })}
          </div>
        `
        )
        .join("");

    const renderTrendingBlogsTab =
      data.trendingBlogs.length > 0
        ? renderMinimalBlogs(data.trendingBlogs)
        : nodatamessage(`No blogs found in trending blogs`);

    const renderTrendingBlogsSidebar =
      data.trendingBlogs.length > 0
        ? renderMinimalBlogs(data.trendingBlogs)
        : nodatamessage(`No blogs found in trending blogs`);

    const formHtml = `
      <section class="flex justify-center !gap-10">
        <div class="w-full">
          ${InPageNavigation(tabs, "home")}
          <div id="home-contents">
            <div class="tab-content block" id="content-home">
              ${renderLatestBlogs}
            </div>
            <div class="tab-content hidden" id="content-trending-blogs">
              ${renderTrendingBlogsTab}
            </div>
            <div class="tab-content hidden" id="content-category-blogs">
              <div id="category-blog-container" class="animate-item"></div>
            </div>
          </div>
        </div>
        <div class="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-gray-200 !pl-8 !pt-3 max-md:hidden">
          <div class="flex flex-col gap-10">
            <div>
              <h1 class="font-medium text-xl !mb-8">Stories from all interests</h1>
              <div class="flex gap-3 flex-wrap !mb-8">
                ${categories
                  .map(
                    (category, i) =>
                      `<button class="tag" key="${i}">${category}</button>`
                  )
                  .join("")}
              </div>
            </div>
            <div>
              <h1 class="font-medium text-xl !mb-8">Trending <i class="fa-solid fa-arrow-trend-up"></i></h1>
              ${renderTrendingBlogsSidebar}
            </div>
          </div>
        </div>
      </section>
    `;

    setTimeout(() => {
      initInPageNavigation("home");

      const tagButtons = document.querySelectorAll(".tag");
      tagButtons.forEach((btn) => {
        btn.addEventListener("click", this.loadBlogByCategory.bind(this));
      });
    }, 0);

    return AnimationWrapper({
      children: formHtml,
      fromY: 30,
      toY: 0,
      duration: 0.5,
      targetClass: "animate-item",
      stagger: 0.1,
    });
  }

  private async loadBlogByCategory(event: Event) {
    const btn = event.currentTarget as HTMLElement;
    const category = btn.textContent?.trim().toLowerCase();
    if (!category) return;

    if (btn.classList.contains("active")) {
      btn.classList.remove("active");
      const container = document.getElementById("category-blog-container");
      if (container) {
        container.innerHTML = `<p class="text-center text-gray-500">Please select a category to load blogs.</p>`;
      }
      this.showTab("content-home");
      return;
    }

    const tagButtons = document.querySelectorAll(".tag");
    tagButtons.forEach((button) => button.classList.remove("active"));

    btn.classList.add("active");

    const container = document.getElementById("category-blog-container");
    if (!container) return;

    container.innerHTML = `
      <div class="flex justify-center py-10">
        <i class="fas fa-spinner fa-spin text-2xl text-gray-500"></i>
      </div>
    `;

    try {
      const blogService = new BlogService();
      const blogs = await blogService.getBlogsByTags(category);

      if (!blogs || blogs.length === 0) {
        container.innerHTML = nodatamessage(
          `No blogs found in category "${category}".`
        );
      } else {
        container.innerHTML = blogs
          .map(
            (blog, i) => `
            <div class="animate-item">
              ${BlogCard({
                content: {
                  publishedAt: blog.publishedAt ?? "",
                  tags: blog.tags ?? [],
                  title: blog.title ?? "",
                  des: blog.des ?? "",
                  banner: blog.banner ?? "",
                  activity: {
                    total_likes: blog.activity?.total_likes ?? 0,
                  },
                  blog_id: blog.blog_id ?? "",
                },
                author: blog.author?.personal_info || {
                  fullname: "Unknown",
                  profile_img: "default.png",
                  username: "anonymous",
                },
                index: i,
              })}
            </div>
          `
          )
          .join("");
      }

      this.showTab("content-category-blogs");
    } catch (error) {
      container.innerHTML = `<p class="text-center text-red-500">Error loading blogs: ${
        (error as Error).message
      }</p>`;
    }
  }

  private showTab(tabId: string) {
    const tabContents = document.querySelectorAll(".tab-content");
    tabContents.forEach((tab) => {
      if (tab.id === tabId) {
        tab.classList.remove("hidden");
        tab.classList.add("block");
      } else {
        tab.classList.add("hidden");
        tab.classList.remove("block");
      }
    });
  }

  renderDetail(blog: BlogModel): string {
    if (!blog) {
      return `<p>Blog not found.</p>`;
    }

    const { title, content, banner, author, publishedAt } = blog;

    const blocks = Array.isArray(content)
      ? content[0]?.blocks || []
      : content?.blocks || [];

    const blocksHtml = blocks
      .map((block: ContentBlock) => renderContentBlock(block))
      .join("");

    const fullname = author?.personal_info?.fullname || "Unknown Author";
    const username = author?.personal_info?.username || "";
    const profile_img = author?.personal_info?.profile_img || "";

    const html = `
    <article class="blog-detail max-w-[900px] center !py-10 !px-5 animate-item">

      <img src="${
        banner || ""
      }" alt="Banner" class="aspect-video w-full object-cover" />

      <h1 class="!mt-8 text-3xl font-bold">${title || "No title"}</h1>

      <div class="flex justify-between items-center !mt-4 !mb-8">
        <div class="flex items-center gap-4">
          <img src="${profile_img}" alt="${fullname}" class="w-12 h-12 rounded-full object-cover" />
          <div>
            <p class="capitalize m-0">${fullname}</p>
            <a href="#/profile/${username}" class="underline text-sm">@${username}</a>
          </div>
        </div>

        <time class="text-dark-grey opacity-75 text-sm">
          ${publishedAt ? new Date(publishedAt).toLocaleDateString() : ""}
        </time>
      </div>

      <div id="blog-interaction" class="mt-6"></div>

      <div class="blog-content font-inter font-serif">${blocksHtml}</div>

    </article>
  `;

    return AnimationWrapper({
      children: html,
      fromY: 30,
      toY: 0,
      duration: 0.5,
      targetClass: "animate-item",
      stagger: 0.1,
    });
  }
}
