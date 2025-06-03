import { nanoid } from "nanoid";
import User from "../models/User.js";

const generateUsername = async (email) => {
  let username = email.split("@")[0];

  const exists = await User.findOne({ "personal_info.username": username });
  if (exists) {
    username += nanoid(5);
  }

  return username;
};

export default generateUsername;
