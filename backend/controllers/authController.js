import bcryptjs from "bcryptjs";
import { nanoid } from "nanoid";
import { getAuth } from "../config/firebaseAdmin.js";
import cloudinary from "../config/cloudinary.js";
import sendEmail from "../config/sendmail.js";

import User from "../models/User.js";
import generateUsername from "../utils/generateUsername.js";
import formatDataToSend from "../utils/formatDataToSend.js";
import { emailRegex, passwordRegex } from "../utils/regex.js";

export const resetPassword = async (req, res) => {
  try {
    let { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required." });
    }

    token = token.trim();
    newPassword = newPassword.trim();

    const user = await User.findOne({
      "resetToken.token": token,
      "resetToken.expiresAt": { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    user.personal_info.password = await bcryptjs.hash(newPassword, 10);

    user.resetToken = { token: null, expiresAt: null };

    await user.save();

    return res
      .status(200)
      .json({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("resetPassword error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    email = email.trim().toLowerCase();

    const user = await User.findOne({ "personal_info.email": email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    const resetToken = nanoid(32);

    user.resetToken = {
      token: resetToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    };

    await user.save();

    const resetLink = `${process.env.APP_DOMAIN}#/reset-password?token=${resetToken}`;

    const emailSubject = "Password Reset Request";
    const emailBody = `
      <p>Hi ${user.personal_info.fullname},</p>
      <p>You requested to reset your password. Click the link below to set a new password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await sendEmail(email, emailSubject, emailBody);

    return res.status(200).json({ message: "Reset password email sent." });
  } catch (error) {
    console.error("forgotPassword error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUploadUrl = (req, res) => {
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const public_id = `${nanoid()}-${timestamp}`;

    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        public_id,
        folder: "user_profiles",
      },
      process.env.CLOUDINARY_API_SECRET
    );

    return res.status(200).json({
      uploadData: {
        timestamp,
        signature,
        public_id,
        api_key: process.env.CLOUDINARY_API_KEY,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        folder: "user_profiles",
      },
    });
  } catch (err) {
    console.error("Error generating upload signature:", err.message);
    return res.status(500).json({ error: "Failed to generate upload URL" });
  }
};

// Register
export const register = async (req, res) => {
  let { fullname, email, password } = req.body;

  if (!fullname || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (fullname.length < 3) {
    return res
      .status(400)
      .json({ message: "Fullname must be at least 3 characters" });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Email is not valid" });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 6 characters and contain at least one uppercase letter, one lowercase letter, and one number",
    });
  }

  try {
    const hashed_password = await bcryptjs.hash(password, 10);
    const username = await generateUsername(email);

    const user = new User({
      personal_info: {
        fullname,
        email,
        password: hashed_password,
        username,
      },
    });

    const savedUser = await user.save();
    return res.status(200).json(formatDataToSend(savedUser));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    return res.status(500).json({ message: "Error saving user", error });
  }
};

// Login
export const login = async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Email is not valid" });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 6 characters and contain at least one uppercase letter, one lowercase letter, and one number",
    });
  }

  try {
    const user = await User.findOne({ "personal_info.email": email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcryptjs.compare(
      password,
      user.personal_info.password
    );

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    return res.status(200).json(formatDataToSend(user));
  } catch (error) {
    return res.status(500).json({ message: "Error logging in", error });
  }
};

// Google Auth
export const googleAuth = async (req, res) => {
  const { id_token } = req.body;

  if (!id_token) {
    return res.status(400).json({ message: "ID token is required" });
  }

  try {
    const decodedUser = await getAuth().verifyIdToken(id_token);
    const { email, name, picture } = decodedUser;

    let user = await User.findOne({ "personal_info.email": email });

    if (user) {
      if (!user.google_auth) {
        return res.status(400).json({
          message: "This email is already registered with a password",
        });
      }

      return res.status(200).json(formatDataToSend(user));
    }

    const username = await generateUsername(email);

    user = new User({
      personal_info: {
        fullname: name,
        email,
        profile_img: picture,
        username,
      },
      google_auth: true,
    });

    const savedUser = await user.save();
    return res.status(200).json(formatDataToSend(savedUser));
  } catch (error) {
    console.error("Google Auth error:", error);
    return res
      .status(500)
      .json({ message: "Google authentication failed", error: error.message });
  }
};
