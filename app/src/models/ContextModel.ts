import { SessionModel } from "./SessionModel";

export type UserContext = {
  accessToken: string | null;
  profileImg: string | null;
  username: string | null;
};

type BlogContext = {
  blog_id?: string;
  title: string;
  banner: string;
  content: {
    time?: number;
    blocks: any[];
    version?: string;
  };
  tags: string[];
  des: string;
  author: { personal_info: any };
  draft: boolean;
};

const defaultBlog: BlogContext = {
  blog_id: "",
  title: "",
  banner: "",
  content: { blocks: [] },
  tags: [],
  des: "",
  author: { personal_info: {} },
  draft: true,
};

export class ContextModel {
  user: UserContext;
  blog: BlogContext;

  constructor() {
    this.user = this.loadUser();
    this.blog = this.loadBlog();
  }

  private loadUser(): UserContext {
    try {
      const data = SessionModel.get("user");
      const user = data ? JSON.parse(data) : {};
      return {
        accessToken: user.accessToken || null,
        profileImg: user.profileImg || null,
        username: user.username || null,
      };
    } catch {
      return { accessToken: null, profileImg: null, username: null };
    }
  }

  setAccessToken(token: string | null) {
    this.user.accessToken = token;
    this.updateStoredUser({ accessToken: token });

    const storedUser = this.loadUser();
    this.user = storedUser;
  }

  setProfileImg(url: string | null) {
    this.user.profileImg = url;
    this.updateStoredUser({ profileImg: url });
  }

  setUsername(name: string | null) {
    this.user.username = name;
    this.updateStoredUser({ username: name });
  }

  private updateStoredUser(partial: Partial<UserContext>) {
    const updated: UserContext = {
      ...this.user,
      ...partial,
    };

    Object.keys(updated).forEach((key) => {
      if (updated[key as keyof UserContext] === null) {
        delete (updated as any)[key];
      }
    });

    this.user = updated;

    if (Object.keys(updated).length > 0) {
      SessionModel.store("user", updated);
    } else {
      SessionModel.remove("user");
    }
  }

  private loadBlog(): BlogContext {
    try {
      const data = SessionModel.get("blog");
      return data ? JSON.parse(data) : { ...defaultBlog };
    } catch {
      return { ...defaultBlog };
    }
  }
  setBlogField<K extends keyof BlogContext>(field: K, value: BlogContext[K]) {
    this.blog[field] = value;
    this.updateStoredBlog();
  }

  setBlog(data: BlogContext) {
    if (Array.isArray(data.content)) {
      data.content = data.content[0];
    }

    this.blog = data;
    this.updateStoredBlog();
  }

  resetBlog() {
    this.blog = { ...defaultBlog };
    this.updateStoredBlog();
  }

  private updateStoredBlog() {
    try {
      SessionModel.store("blog", this.blog);
    } catch (err) {
      console.error("Failed to store blog:", err);
    }
  }
}

export const AppContext = new ContextModel();
