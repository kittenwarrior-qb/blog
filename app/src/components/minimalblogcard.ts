import { timeAgo } from "./date";
import { AnimationWrapper } from "../libs/gsapAnimation";

export const MinimalBlogCard = (blog: {
  content: {
    blog_id: string;
    title: string;
    publishedAt: string;
  };
  author: {
    fullname: string;
    profile_img: string;
    username: string;
  };
  index?: number;
}) => {
  const { blog_id, title, publishedAt } = blog.content;
  const { fullname, profile_img, username } = blog.author;
  const index = blog.index ?? 0;
  const delay = index * 0.1;

  const formHtml = `
    <a href="#/blog/${blog_id}" class="flex gap-5 mb-4 items-center">
      <h1 class="blog-index">${index < 9 ? "0" + (index + 1) : index + 1}</h1>

      <div>
        <div class="flex gap-2 items-center mb-2 text-sm text-gray-600">
          <img src="${profile_img}" class="w-6 h-6 rounded-full" />
          <p class="line-clamp-1">${fullname} @${username}</p>
          <p class="min-w-fit">${timeAgo(publishedAt)}</p>
        </div>
        <h1 class="blog-title">${title}</h2>
      </div>
    </a>
  `;

  return AnimationWrapper({
    children: formHtml,
    fromY: 30,
    toY: 0,
    duration: 0.3,
    delay,
  });
};
