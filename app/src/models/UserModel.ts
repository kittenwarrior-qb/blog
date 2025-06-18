export type SocialLinks = {
  youtube?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  github?: string;
  website?: string;
};

export type PersonalInfo = {
  fullname: string;
  email: string;
  password: string;
  username: string;
  bio: string;
  profile_img: string;
};

export type AccountInfo = {
  total_posts: number;
  total_reads: number;
};

export type UserParams = {
  _id?: string;
  personal_info: PersonalInfo;
  social_links?: SocialLinks;
  account_info: AccountInfo;
  google_auth?: boolean;
  blogs?: string[];
  joinedAt?: string;
  updatedAt?: string;
};

export class UserModel {
  _id?: string;
  personal_info: PersonalInfo;
  social_links?: SocialLinks;
  account_info: AccountInfo;
  google_auth?: boolean;
  blogs?: string[];
  joinedAt?: string;
  updatedAt?: string;

  constructor(data: UserParams) {
    this._id = data._id;
    this.personal_info = data.personal_info;
    this.social_links = data.social_links ?? {};
    this.account_info = data.account_info ?? { total_posts: 0, total_reads: 0 };
    this.google_auth = data.google_auth ?? false;
    this.blogs = data.blogs ?? [];
    this.joinedAt = data.joinedAt;
    this.updatedAt = data.updatedAt;
  }
}
