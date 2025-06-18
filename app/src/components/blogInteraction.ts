import { type BlogParams } from "../models/BlogModel";
import { type UserContext } from "../models/ContextModel";

export class BlogInteraction {
  private container: HTMLElement;
  private blog: BlogParams;
  private user: UserContext;
  private isLikedByUser = false;

  constructor(containerId: string, blog: BlogParams, user: UserContext) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error("Container not found");
    this.container = container;
    this.blog = blog;
    this.user = user;
    this.render();
    this.getIsLikedByUser();
  }
  static init(containerId: string, blog: BlogParams, user: UserContext) {
    const el = document.getElementById(containerId);
    if (!el) {
      console.warn(`[BlogInteraction] Container '${containerId}' not found`);
      return;
    }

    new BlogInteraction(containerId, blog, user);
  }

  private render() {
    const { total_likes, total_comments } = this.blog.activity;

    this.container.innerHTML = `
        <hr class="border-gray-300 my-2" />
        <div class="flex gap-6 justify-between">
            <div class="flex gap-3 items-center">
            <button id="like-btn" class="w-10 h-10 rounded-full flex items-center justify-center ">
              <i id="like-icon" class="fa-regular fa-heart"></i>
            </button>
            <p id="like-count" class="text-xl">${total_likes}</p>

            <button id="comment-btn" class="w-10 h-10 rounded-full flex items-center justify-center ">
                <i class="fa-regular fa-comment"></i>
            </button>
            <p id="comment-count" class="text-xl">${total_comments}</p>
            </div>

            <div class="flex gap-6 items-center">
            <a id="edit-link" class="underline hover:text-purple hidden">Edit</a>
            <a id="share-twitter" target="_blank">
                <i class="fa-regular fa-share-from-square"></i>
            </a>
            </div>
        </div>
        <hr class="border-gray-300 my-2 mb-5" />
        `;

    this.bindEvents();
    this.updateShareLink();
    this.showEditLinkIfAuthor();
  }

  private bindEvents() {
    const likeBtn = this.container.querySelector(
      "#like-btn"
    ) as HTMLButtonElement;
    const commentBtn = this.container.querySelector(
      "#comment-btn"
    ) as HTMLButtonElement;

    likeBtn?.addEventListener("click", () => this.handleLike());

    commentBtn?.addEventListener("click", () => {
      const commentWrapper = document.getElementById("comments-wrapper");
      if (commentWrapper) {
        commentWrapper.classList.toggle("hidden");
      }
    });
  }

  private updateUI() {
    const likeBtn = this.container.querySelector(
      "#like-btn"
    ) as HTMLButtonElement;
    const likeIcon = this.container.querySelector("#like-icon") as HTMLElement;
    const likeCount = this.container.querySelector(
      "#like-count"
    ) as HTMLElement;

    likeCount.textContent = this.blog.activity.total_likes.toString();
    likeBtn.className = `w-10 h-10 rounded-full flex items-center justify-center ${
      this.isLikedByUser ? "bg-red/20 text-red" : "bg-grey/80"
    }`;
    likeIcon.className = `fi ${
      this.isLikedByUser ? "fi-sr-heart" : "fi-rr-heart"
    }`;
  }

  private handleLike() {
    if (!this.user.accessToken) {
      alert("Please login to like this blog");
      return;
    }

    const wasLiked = this.isLikedByUser;
    this.isLikedByUser = !this.isLikedByUser;
    this.blog.activity.total_likes += this.isLikedByUser ? 1 : -1;
    this.updateUI();

    fetch(import.meta.env.VITE_SERVER_DOMAIN + "/like-blog", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.user.accessToken}`,
      },
      body: JSON.stringify({
        _id: this.blog.blog_id,
        islikedByUser: wasLiked,
      }),
    }).catch(console.error);
  }

  private getIsLikedByUser() {
    if (!this.user.accessToken) return;

    fetch(import.meta.env.VITE_SERVER_DOMAIN + "/isliked-by-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.user.accessToken}`,
      },
      body: JSON.stringify({ _id: this.blog.blog_id }),
    })
      .then((res) => res.json())
      .then((data) => {
        this.isLikedByUser = Boolean(data.result);
        this.updateUI();
      })
      .catch(console.error);
  }

  private updateShareLink() {
    const link = this.container.querySelector(
      "#share-twitter"
    ) as HTMLAnchorElement;
    const shareURL = `https://twitter.com/intent/tweet?text=Read ${this.blog.title}&url=${location.href}`;
    link.href = shareURL;
  }

  private showEditLinkIfAuthor() {
    const link = this.container.querySelector(
      "#edit-link"
    ) as HTMLAnchorElement;
    if (this.user.username === this.blog.author.personal_info.username) {
      link.href = `#/editor/${this.blog.blog_id}`;
      link.classList.remove("hidden");
    }
  }
}
