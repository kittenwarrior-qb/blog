import { SessionModel } from './SessionModel';

type UserContext = {
  accessToken: string | null;
  profileImg: string | null;
  username: string | null;
};

type BlogContext = {
  title: string;
  banner: string;
  content: {
    blocks: any[];
  };
  tags: string[];
  des: string;
  author: { personal_info: any };
};

const defaultBlog: BlogContext = {
  title: '',
  banner: '',
  content: { blocks: [] },
  tags: [],
  des: '',
  author: { personal_info: {} },
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
      const data = SessionModel.get('user');
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

    if (Object.keys(updated).length > 0) {
      SessionModel.store('user', updated);
    } else {
      SessionModel.remove('user');
    }
  }


  private loadBlog(): BlogContext {
    try {
      const data = SessionModel.get('blog');
      return data ? JSON.parse(data) : { ...defaultBlog };
    } catch {
      return { ...defaultBlog };
    }
  }

  setBlogField(field: keyof BlogContext, value: any) {
    this.blog[field] = value;
    this.updateStoredBlog();
  }

  resetBlog() {
    this.blog = { ...defaultBlog };
    this.updateStoredBlog();
  }

  private updateStoredBlog() {
    try {
      SessionModel.store('blog', this.blog);
    } catch (err) {
      console.error('Failed to store blog:', err);
    }
  }
}

export const AppContext = new ContextModel();
