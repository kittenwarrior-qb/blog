export type AuthParams = {
  accessToken: string;
  profile_img: string;
  username: string;
  role?: string;
};

export class AuthModel {
  accessToken: string;
  profile_img: string;
  username: string;
  role?: string;

  constructor(data: AuthParams) {
    this.accessToken = data.accessToken;
    this.profile_img = data.profile_img;
    this.username = data.username;
    this.role = data.role;
  }
}
