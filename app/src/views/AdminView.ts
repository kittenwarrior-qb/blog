import { BlogModel } from "../models/BlogModel";
import { AppContext } from "../models/ContextModel";

export class AdminView {
  public AdminSidebar(): string {
    return `
      <aside class="w-60 h-screen bg-gray-100 p-6 shadow-md">
        <h2 class="text-xl font-semibold mb-6">Admin Panel</h2>
        <ul class="space-y-4 text-gray-700">
          <li><a href="#/dashboard" class="hover:text-blue-600">Dashboard</a></li>
          <li><a href="#/admin/blogs" class="hover:text-blue-600">Blogs</a></li>
          <li><a href="#/comments" class="hover:text-blue-600">Comments</a></li>
          <li><a href="#/likes" class="hover:text-blue-600">Likes</a></li>
          <li><a href="#/users" class="hover:text-blue-600">Users</a></li>
        </ul>
      </aside>
    `;
  }

  public AdminPage(): string {
    return `
      <div class="flex">
        ${this.AdminSidebar()}
        <main class="flex-1 p-8">
          <h1 class="text-2xl font-bold mb-4">Welcome to Admin Page</h1>
          <p class="text-gray-600">Select a section from the sidebar to manage your content.</p>
        </main>
      </div>
    `;
  }

  public AdminBlogPage(blogs: BlogModel[]): string {
    console.log(blogs);
    console.log(AppContext.user.accessToken)
    
    const blogRows = blogs.map((blog, index) => `
      <tr class="border-b hover:bg-gray-50">
        <td class="py-3 px-4">${index + 1}</td>
        <td class="py-3 px-4">${blog.title}</td>
        <td class="py-3 px-4">${blog.author.personal_info.username}</td>
        <td class="py-3 px-4">
          <button class="text-blue-600 hover:underline mr-2">Edit</button>
          <button onClick="handleDeleteBlog(${blog.blog_id})" class="text-red-600 hover:underline">Delete</button>
        </td>
      </tr>
    `).join("");

    return `
      <div class="flex">
        ${this.AdminSidebar()}
        <main class="flex-1 p-8">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">Manage Blogs</h1>
            <button class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">+ New Blog</button>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full border border-gray-200">
              <thead>
                <tr class="bg-gray-100 text-left text-gray-700 text-sm uppercase">
                  <th class="py-3 px-4 border-b">#</th>
                  <th class="py-3 px-4 border-b">Title</th>
                  <th class="py-3 px-4 border-b">Author</th>
                  <th class="py-3 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${blogRows}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    `;
  }
}
