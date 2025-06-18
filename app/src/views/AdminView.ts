import { BlogModel } from "../models/BlogModel";
import { AppContext } from "../models/ContextModel";

export class AdminView {
  public AdminSidebar(): string {
    return `
      <div class="sticky left-0 top-0 flex flex-col justify-between w-64 h-screen bg-white text-black border-r border-gray-200">
        <div class="px-9 pt-10 pb-6 border-b border-gray-200">
          <a class="font-gelasio font-semibold text-xl block text-left" href="#/">
            Vietnews
          </a>
        </div>

        <nav class="flex-1 px-5 pt-6">
          <a href="#/admin/dashboard" class="sidebar-link block px-4 rounded-lg hover:bg-gray-100 transition">
            <i class="fa-solid fa-chart-line mr-2"></i> Dashboard
          </a>
          <a href="#/admin/blogs" class="sidebar-link block px-4 rounded-lg hover:bg-gray-100 transition">
            <i class="fa-solid fa-newspaper mr-2"></i> Blogs
          </a>
          <a href="#/admin/users" class="sidebar-link block px-4 rounded-lg hover:bg-gray-100 transition">
            <i class="fa-solid fa-users mr-2"></i> Users
          </a>
        </nav>

        <div class="px-5 py-6 border-t border-gray-200">
          <a href="#/logoutBtn" class="block py-2 px-4 text-red-600 rounded-lg hover:bg-red-50 transition">
            <i class="fa-solid fa-sign-out-alt mr-2"></i> Logout
          </a>
        </div>
      </div>
    `;
  }

  public AdminHeader(searchKeyword: String): string {
    return `
      <header class="d-flex flex justify-between items-center gap-4">
        <div>
          <p class="font-gelasio text-2xl font-semibold text-slate-800">
            Welcome, ${AppContext.user.username}
          </p>
          <p class="text-base text-slate-500">
            Monitor all blogs and manage them
          </p>
        </div>

        <div class="relative">
          <input
            id="admin-search-input"
            type="text"
            placeholder="Search"
            value="${searchKeyword}"
            class="w-full bg-gray-50 border-gray-200 border p-4 pr-[5%] md:pr-6 placeholder:text-gray-500 text-black md:pl-5"
          />
          <button
            id="admin-search-btn"
            class="absolute right-[10%] top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
          >
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>
      </header>

    `;
  }

  public AdminDashBoard(
    totalBlogs: number,
    totalUsers: number,
    searchKeyword: String
  ): string {
    return `
  <div class="flex h-screen bg-gray-100">
    ${this.AdminSidebar()}

    <div class="admin-layout flex-1 px-6 py-5 overflow-auto">
      ${this.AdminHeader(searchKeyword)}

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
        <div class="bg-white p-4 rounded-lg shadow-md">
          <p class="">Total Blogs</p>
          <p class="!mt-5">${totalBlogs}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-md">
          <p class="">Total Users</p>
          <p class="!mt-5">${totalUsers}</p>
        </div>
      </div>
    </div>
  </div>
`;
  }

  public AdminBlogPage(
    blogs: BlogModel[],
    pagination: {
      totalBlogs: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    },
    selectedTag: string,
    searchKeyword: string
  ): string {
    const blogRows = blogs
      .map((blog, index) => {
        const {
          blog_id,
          title,
          des,
          banner,
          tags,
          author,
          publishedAt,
          draft,
        } = blog;

        return `
        <tr class=" hover:bg-gray-50 transition">
          <td class="px-4 py-3">
            <div class="flex items-center gap-3">
              <img src="${banner}" alt="${title}" class="w-20 h-14 object-cover rounded" />
              <div class="hover:underline">
              <a href="#/blog/${blog_id}">
                <p class="line-clamp-1 max-w-[200px]">${title}</p>
                <p class="line-clamp-1 max-w-[220px]">${des}</p>
              </a>
              </div>
            </div>
          </td>

          <td class="px-4 py-3  text-gray-600 whitespace-nowrap">
            ${new Date(publishedAt!).toLocaleDateString("vi-VN")}
          </td>

          <td class="px-4 py-3">
            <div class="flex items-center gap-2">
              <img src="${
                author?.personal_info?.profile_img
              }" class="w-6 h-6 rounded-full object-cover" />
              <span class="text-sm text-gray-700">@${
                author?.personal_info?.username
              }</span>
            </div>
          </td>

          <td class="px-4 py-3">
            ${
              tags?.[0]
                ? `<span class="inline-block px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-full">
                    ${tags[0]}
                  </span>`
                : `<span class="inline-block px-3 py-1 text-xs font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-full italic">
                    No tag
                  </span>`
            }
          </td>

          <td class="px-4 py-3">
            ${
              draft
                ? `<span class="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">Draft</span>`
                : `<span class="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">Published</span>`
            }
          </td>

          <td class="px-4 py-3 space-x-2">
            <button
              data-id="${blog_id}"
              class="btn-edit inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-800 border border-blue-100 rounded-full hover:bg-blue-50 transition"
            >
              <i class="fas fa-edit text-sm"></i>
            </button>
            <button
              data-id="${blog_id}"
              class="btn-delete inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 border border-red-100 rounded-full hover:bg-red-50 transition"
            >
              <i class="fas fa-trash-alt text-sm"></i>
            </button>
          </td>


        </tr>
      `;
      })
      .join("");

    return `
  <div class="flex min-h-screen">
    ${this.AdminSidebar()}
    <main  id="admin-main-content" class="admin-layout flex-1 px-4 py-5">
      ${this.AdminHeader(searchKeyword)}
      <div class="my-6 flex justify-between items-center">
        <select id="tagFilter" class="border px-3 py-2 rounded text-sm">
          <option value="">All tags</option>
          <option value="game">Game</option>
          <option value="phim">Phim</option>
          <option value="news">News</option>
          <option value="anime">Anime</option>
        </select>
      </div>

      <div class="overflow-x-auto bg-white rounded-xl shadow border py-5 px-4 border-gray-200">
        <table class="w-full text-sm text-left">
          <thead class="text-gray-600 uppercase text-xs">
            <tr>
              <th class="px-4 py-3">Blog</th>
              <th class="px-4 py-3">Published</th>
              <th class="px-4 py-3">Author</th>
              <th class="px-4 py-3">Tag</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${blogRows}
          </tbody>
        </table>
      </div>

      ${this.generatePaginationHTML(pagination)}
    </main>
  </div>
`;
  }
  public generatePaginationHTML(pagination: {
    totalPages: number;
    currentPage: number;
  }): string {
    const { currentPage, totalPages } = pagination;
    let html = `<div class="pagination mt-6 flex gap-1 justify-center">`;

    html += `<button class="btn-page px-3 py-1 border rounded border-gray-50" data-page="${
      currentPage - 1
    }" ${currentPage <= 1 ? "disabled" : ""}>Previous</button>`;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        html += `<button class="btn-page px-3 py-1 rounded ${
          i === currentPage ? "bg-blue-500 text-white" : ""
        }" data-page="${i}">${i}</button>`;
      } else if (
        (i === 2 && currentPage > 3) ||
        (i === totalPages - 1 && currentPage < totalPages - 2)
      ) {
        html += `<span class="px-2">...</span>`;
      }
    }

    html += `<button class="btn-page px-3 py-1 border rounded border-gray-50" data-page="${
      currentPage + 1
    }" ${currentPage >= totalPages ? "disabled" : ""}>Next</button>`;

    html += `</div>`;
    return html;
  }

  public afterRender() {
    const hash = window.location.hash;
    const queryIndex = hash.indexOf("?");
    const queryString = queryIndex >= 0 ? hash.substring(queryIndex) : "";
    const urlParams = new URLSearchParams(queryString);

    const currentTag = urlParams.get("tag") || "";
    const currentSearch = urlParams.get("search") || "";

    // Gán sự kiện phân trang
    document.querySelectorAll(".btn-page").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.currentTarget as HTMLElement;
        const page = target.getAttribute("data-page");

        if (page) {
          window.location.hash = `#/admin/blogs?page=${page}&tag=${encodeURIComponent(
            currentTag
          )}&search=${encodeURIComponent(currentSearch)}`;
        }
      });
    });

    const tagFilter = document.getElementById("tagFilter") as HTMLSelectElement;
    if (tagFilter) {
      tagFilter.value = currentTag;

      tagFilter.addEventListener("change", () => {
        const selectedTag = tagFilter.value;
        window.location.hash = `#/admin/blogs?page=1&tag=${encodeURIComponent(
          selectedTag
        )}&search=${encodeURIComponent(currentSearch)}`;
      });
    }

    const searchInput = document.getElementById(
      "admin-search-input"
    ) as HTMLInputElement;
    const searchBtn = document.getElementById("admin-search-btn");

    if (searchInput) {
      searchInput.value = currentSearch;
    }

    if (searchBtn && searchInput) {
      searchBtn.addEventListener("click", () => {
        const keyword = searchInput.value.trim();
        const tag = tagFilter?.value || "";
        const page = 1;

        window.location.hash = `#/admin/blogs?page=${page}&tag=${encodeURIComponent(
          tag
        )}&search=${encodeURIComponent(keyword)}`;
      });

      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          searchBtn.click();
        }
      });
    }
  }

  public AdminBlogEditForm(blog: BlogModel): string {
    return `
    <button id="btn-back" class="hover:underline text-sm pb-5 flex items-center">
      Back to blog list
    </button>
    <div class="mb-6 flex-1 px-4 py-5 bg-white shadow border border-gray-200 rounded-xl overflow-x-auto">
      <p class="text-2xl font-bold mb-6 text-gray-800">Edit Blog</p>
      <form id="edit-blog-form" data-blog-id="${
        blog.blog_id
      }" class="space-y-5">
        <div>
          <label for="title" class="block mb-1 text-sm font-medium text-gray-700">Title</label>
          <input name="title" id="title" value="${blog.title}"
            class="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>

        <div>
          <label for="des" class="block mb-1 text-sm font-medium text-gray-700">Description</label>
          <textarea name="des" id="des"
            class="border border-gray-300 rounded-lg p-3 w-full h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            required>${blog.des}</textarea>
        </div>

        <div>
          <label for="tags" class="block mb-1 text-sm font-medium text-gray-700">Tags (comma separated)</label>
          <input name="tags" id="tags" value="${blog.tags?.join(", ") ?? ""}"
            class="border border-gray-300 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label for="banner-file-input" class="block mb-1 text-sm font-medium text-gray-700">Upload Banner</label>
          <input type="file" id="banner-file-input" accept="image/*"
            class="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          <input type="hidden" name="banner" id="banner" value="${
            blog.banner
          }" />
          <img id="banner-preview" src="${blog.banner}" alt="Banner Preview"
            class="mt-3 w-full max-h-60 object-cover rounded-lg border border-gray-300">
        </div>

        <div class="flex items-center justify-between">
          <label for="draft" class="text-sm font-medium text-gray-700">Save as Draft</label>
          <label class="inline-flex items-center cursor-pointer">
            <input type="checkbox" id="draft" name="draft" class="sr-only" ${
              blog.draft ? "checked" : ""
            } />
            <div
              class="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 relative transition-colors duration-300">
              <div
                class="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 peer-checked:translate-x-5">
              </div>
            </div>
          </label>
        </div>

        <div class="pt-4">
          <button type="submit"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-semibold transition duration-200">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  `;
  }

  initBlogPageEvents(
    onEdit: (id: string) => void,
    onDelete: (id: string) => void
  ) {
    document.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = (btn as HTMLElement).dataset.id!;

        onEdit(id);
      });
    });

    document.querySelectorAll(".btn-delete").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = (btn as HTMLElement).dataset.id!;
        onDelete(id);
      });
    });
  }
}
