import { timeAgo } from "./date";
import { AnimationWrapper } from "../libs/gsapAnimation";

export const BlogCard = (blog: {
  content: {
    publishedAt: string;
    tags: string[];
    title: string;
    des: string;
    banner: string;
    activity: { total_likes: number };
    blog_id: string;
  };
  author: {
    fullname: string;
    profile_img: string;
    username: string;
  };
  index?: number; 
}) => {
  const {
    publishedAt,
    tags,
    title,
    des,
    banner,
    activity: { total_likes },
    blog_id: id
  } = blog.content;

  const { fullname, profile_img, username } = blog.author;
  const index = blog.index ?? 0;
  const delay = index * 0.1;

  const formHtml = `
  <a href="#/blog/${id}">

    <div class="flex gap-8 items-center border-b border-gray-200 !pb-5 !mb-4">
      <div class="w-full">
        <div class="flex gap-3 items-center mb-7">
          <img src="${profile_img}" alt="${fullname}" class="w-6 h-6 rounded-full" />
          <p class="line-clamp-1">${fullname} @${username}</p>
          <p class="min-w-fit">${timeAgo(publishedAt)}</p>
        </div>
        
        <h1 class="blog-title">${title}</h1>
        <p class="!my-3 text-xl font-gelasio leading-7 max-sm:hidden md:max-[1100px]:hidden line-clamp-2">${des}</p>

        <div class="flex gap-4 !mt-7">
          <span class="btn-light !py-1 !px-4">${tags[0]}</span>
          <span class="!ml-3 flex items-center gap-2 text-gray-600">
            <i class="fa-regular fa-heart"></i>
            ${total_likes}
          </span>
        </div>
      </div>

      <div class="h-28 aspect-square bg-gray-50">
        <img src="${banner}" alt="Blog banner" class="w-full h-full aspect-square object-cover" />
      </div>
    </div>
    </a>
  `;

  return AnimationWrapper({
    children: formHtml,
    fromY: 30,
    toY: 0,
    duration: 0.4,
    delay,
  });
};
