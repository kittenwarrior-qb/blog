export type AuthParams = {
  accessToken: string;
  profile_img: string;
  username: string;
};

export class AuthModel {
  accessToken: string;
  profile_img: string;
  username: string;

  constructor(data: AuthParams) {
    this.accessToken = data.accessToken;
    this.profile_img = data.profile_img;
    this.username = data.username;
  }
}
