import { AnimationWrapper } from "../libs/gsapAnimation";
import { UserModel } from "../models/UserModel";
import { AppContext } from "../models/ContextModel";
import { BlogModel } from "../models/BlogModel";
import { BlogCard } from "../components/blogcard";
import { nodatamessage } from "../components/nodatamessage";
import {
  InPageNavigation,
  initInPageNavigation,
} from "../libs/inpagenavigation";

export class ProfileView {
  renderProfile(
    profile: UserModel,
    blogs: BlogModel[] = [],
    drafts: BlogModel[] = []
  ): string {
    const isOwner =
      AppContext.user?.username === profile.personal_info.username;
    const tabs = [
      { label: "Latest Blogs" },
      ...(isOwner ? [{ label: "Your Draft" }] : []),
      { label: "About" },
    ];

    const blogCards = blogs.length
      ? blogs
          .map((blog, i) =>
            BlogCard({
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
            })
          )
          .join("")
      : nodatamessage("No blogs yet.");

    const draftCards = drafts.length
      ? drafts
          .map((draft, i) =>
            BlogCard({
              content: {
                publishedAt: draft.publishedAt ?? "",
                tags: draft.tags ?? ["no tags"],
                title: draft.title ?? "",
                des: draft.des ?? "",
                banner: draft.banner ?? "",
                activity: {
                  total_likes: draft.activity?.total_likes ?? 0,
                },
                blog_id: draft.blog_id ?? "",
              },
              author: draft.author?.personal_info || {
                fullname: "Unknown",
                profile_img: "default.png",
                username: "anonymous",
              },
              index: i,
            })
          )
          .join("")
      : nodatamessage("No blogs yet.");

    const aboutSection = `
      <div class="tab-content hidden" id="content-about">
        <p class="animate-item mt-2">${
          profile.personal_info.bio || nodatamessage("No bio yet.")
        }</p>
      </div>
    `;

    const draftSection = isOwner
      ? `
          <div class="tab-content hidden" id="content-your-draft">
            ${draftCards}
          </div>
        `
      : "";

    const blogSection = `
      <div class="tab-content block" id="content-latest-blogs">
        ${blogCards}
      </div>
    `;

    const profileHtml = `
      <section class="h-cover md:flex flex-row items-start gap-5 min-[900px]:gap-5">
        <div class="flex flex-col max-md:items-center gap-3 min-w-[250px] md:w-[50%] md:pl-8 md:sticky md:top-[100px] md:py-10">
          <img src="${
            profile.personal_info.profile_img
          }" class="w-48 h-48 bg-grey rounded-full md:w-32 md:h-32" />
          <h1 class="text-xl font-medium">@${
            profile.personal_info.username
          }</h1>
          <p class="capitalize h-6">${profile.personal_info.fullname}</p>
          <p>${profile.account_info.total_posts} Blogs - ${
      profile.account_info.total_reads
    } Reads</p>
          ${
            isOwner
              ? `
            <div class="flex gap-4 mt-2">
              <a href="#/edit-profile/${profile.personal_info.username}">
                <p class="btn-light !rounded-md">Edit Profile</p>
              </a>
            </div>
          `
              : ""
          }
        </div>

        <div class="w-full mt-8" id="home-contents">
          ${InPageNavigation(tabs, "home")}
          ${blogSection}
          ${draftSection}
          ${aboutSection}
        </div>
      </section>
    `;
    setTimeout(() => {
      initInPageNavigation("home");
    }, 0);

    return AnimationWrapper({
      children: profileHtml,
      fromY: 30,
      toY: 0,
      duration: 0.5,
      targetClass: "animate-item",
      stagger: 0.1,
    });
  }

  renderEditProfile(profile: UserModel): string {
    const LimitCharacter = 150;
    const {
      personal_info: { fullname, username, email, profile_img, bio },
      social_links,
    } = profile;

    const inputField = (
      label: string,
      name: string,
      value: string,
      disabled = false
    ) => `
    <label class="block mt-4">
      <span class="text-gray-700">${label}</span>
      <input 
        class="input-box mt-1 block w-full" 
        type="text" 
        name="${name}" 
        value="${value}" 
        ${disabled ? "disabled" : ""}
      />
    </label>
  `;

    const socialInputs = Object.entries(social_links ?? {})
      .map(([key, value]) =>
        inputField(
          key.charAt(0).toUpperCase() + key.slice(1),
          key,
          value || "",
          false
        )
      )
      .join("");

    const html = `
      <section class="h-cover md:flex flex-row items-start gap-5 min-[900px]:gap-5 md:px-8 py-10 mt-8">
        <!-- Cột trái -->
        <div class="flex flex-col items-center gap-3 min-w-[250px] md:w-[50%] md:sticky md:top-[100px] mt-10">
          <label for="uploadImg" class="relative block w-48 h-48 md:w-32 md:h-32 bg-gray-200 rounded-full overflow-hidden cursor-pointer">
            <img src="${profile_img}" id="edit-profile-img-preview" class="w-full h-full object-cover" />
            <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-30 text-white opacity-0 hover:opacity-20 transition">
            </div>
          </label>
          <input type="file" id="uploadImg" name="profile_img" hidden />
          <button class="btn-light mt-4" id="upload-btn">Upload</button>
        </div>

        <!-- Cột phải -->
        <div class="w-full md:w-[100%] space-y-4">
          ${inputField("Full Name", "fullname", fullname, true)}
          ${inputField("Email", "email", email, true)}
          ${inputField("Username", "username", username, false)}

          <label class="block">
            <span class="text-gray-700">Bio</span>
            <textarea 
              name="bio" 
              maxlength="${LimitCharacter}" 
              rows="4" 
              class="input-box w-full mt-1 resize-none">${bio || ""}</textarea>
            <p class="text-sm text-gray-500 mt-1">${
              bio?.length || 0
            }/${LimitCharacter} characters</p>
          </label>

          <div class="mt-6">
            <h3 class="text-lg font-medium mb-2">Social Links</h3>
            <div class="grid md:grid-cols-2 gap-4">
              ${socialInputs}
            </div>
          </div>

          <button type="submit" class="btn-dark mt-6 px-8 py-2">Update</button>
        </div>
      </section>

  `;

    return AnimationWrapper({
      children: html,
      fromY: 30,
      toY: 0,
      duration: 0.5,
      targetClass: "edit-profile-container",
      stagger: 0.05,
    });
  }
}
