import { AnimationWrapper } from "../libs/gsapAnimation";
import { AppContext } from "../models/ContextModel";

export const userNavigation = () => {
  const formHTML = `
    <div id="userDropdown" class="bg-white absolute right-0 border border-gray-200 w-60 duration-200 hidden z-50">
        <a href="#/editor">
            <div class="!flex gap-2 link md:!hidden !pl-8 !py-4">
                <i class="fa-solid fa-pen-to-square"></i>
                <p>Write</p>
            </div>
        </a>

        <a href="#/profile/${AppContext.user.username}">
            <div class="link !pl-8 !py-4">Profile</div>
        </a>

        <a href="#/dashboard/blogs">
            <div class="link !pl-8 !py-4">Dashboard</div>
        </a>

        <a href="#/settings/edit-profile">
            <div class="link !pl-8 !py-4">Settings</div>
        </a>


        <button class="text-left hover:bg-gray-100 w-full !pl-8 !py-4 border-t border-gray-200" id="logoutBtn">
            <h1 class="font-bold text-xl">Logout</h1>
            <p class="text-gray-600">@${AppContext.user.username}</p>
        </button>
    </div>
  `;
  return AnimationWrapper({
    children: formHTML,
    fromY: 0,
    toY: 0,
    duration: 0.2,
  });
};
