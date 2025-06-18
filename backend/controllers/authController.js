import bcryptjs from "bcryptjs";
import { nanoid } from "nanoid";
import { getAuth } from "../config/firebaseAdmin.js";
import cloudinary from "../config/cloudinary.js";
import sendEmail from "../config/sendmail.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../middleware/jwt.js";
import User from "../models/User.js";
import generateUsername from "../utils/generateUsername.js";
import formatDataToSend from "../utils/formatDataToSend.js";
import { emailRegex, passwordRegex } from "../utils/regex.js";
import { StatusCodes } from "http-status-codes";

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select(
        "-personal_info.email -personal_info.password -google_auth -updatedAt -blogs"
      )
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    return res.status(200).json({
      users,
      pagination: {
        totalUsers,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("getAllUsers error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const user = await User.findOne({
      "personal_info.username": username,
    }).select(
      "-personal_info.email -personal_info.password -google_auth -updatedAt -blogs"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("getProfile error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const uploadProfileImage = async (req, res) => {
  let { url } = req.body;

  User.findOneAndUpdate({ _id: req.user }, { "personal_info.profile_img": url })
    .then(() => {
      return res.status(200).json({ profile_img: url });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
};

export const uploadProfile = async (req, res) => {
  let { username, bio, social_links = {} } = req.body;

  let bioLimit = 150;

  if (username.length < 3) {
    return res
      .status(403)
      .json({ error: "Username should be at least 3 letters long" });
  }

  if (bio.length > bioLimit) {
    return res
      .status(403)
      .json({ error: `Bio should not be more than ${bioLimit} characters` });
  }

  let socialLinksArr = Object.keys(social_links);

  try {
    for (let i = 0; i < socialLinksArr.length; i++) {
      if (social_links[socialLinksArr[i]].length) {
        let hostname = new URL(social_links[socialLinksArr[i]]).hostname;

        if (
          !hostname.includes(`${socialLinksArr[i]}.com`) &&
          socialLinksArr[i] != "website"
        ) {
          return res.status(403).json({
            error: `${socialLinksArr[i]} link is invalid. You must enter a full link`,
          });
        }
      }
    }
  } catch (err) {
    return res.status(500).json({
      error: "You must provide full social links with http(s) included",
    });
  }

  let updateObj = {
    "personal_info.username": username,
    "personal_info.bio": bio,
    social_links,
  };

  User.findOneAndUpdate({ _id: req.user.id }, updateObj, {
    runValidators: true,
  })
    .then(() => {
      return res.status(200).json({ username });
    })
    .catch((err) => {
      if (err.code == 11000) {
        return res.status(409).json({ error: "username is already taken" });
      }
      return res.status(500).json({ error: err.message });
    });
};

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
  try {
    let { fullname, email, password } = req.body;

    if (!email || !password)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Vui lòng nhập email và mật khẩu" });

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
    const existingUser = await User.findOne({ "personal_info.email": email });
    if (existingUser)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Email đã tồn tại" });

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
    return res.status(StatusCodes.CREATED).json({
      msg: "Đăng ký thành công",
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: error,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Vui lòng nhập email và mật khẩu" });
    }

    const user = await User.findOne({ "personal_info.email": email });
    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Email không tồn tại" });
    }

    const isPasswordValid = await bcryptjs.compare(
      password,
      user.personal_info.password
    );
    if (!isPasswordValid) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Email hoặc mật khẩu không đúng" });
    }

    const refreshToken = generateRefreshToken(
      user._id,
      user.personal_info.role
    );
    const accessToken = generateAccessToken(user._id, user.personal_info.role);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.status(StatusCodes.OK).json({
      msg: "Đăng nhập thành công",
      data: {
        accessToken,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        email: user.personal_info.email,
        role: user.personal_info.role,
      },
    });
  } catch (error) {
    console.log("Login error:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "Lỗi phía server" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    return res.status(StatusCodes.OK).json({ msg: "Đăng xuất thành công" });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Lỗi phía server",
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken)
      return res.status(StatusCodes.UNAUTHORIZED).json({
        msg: "Vui lòng đăng nhập lại",
      });
    const isTokenValid = verifyRefreshToken(refreshToken);
    if (!isTokenValid)
      return res.status(StatusCodes.UNAUTHORIZED).json({
        msg: "Vui lòng đăng nhập lại",
      });
    const { id } = isTokenValid;
    const user = await UserModel.findById(id);
    if (!user)
      return res.status(StatusCodes.UNAUTHORIZED).json({
        msg: "Vui lòng đăng nhập lại",
      });
    const accessToken = generateAccessToken(user._id, user.role);
    return res.status(StatusCodes.OK).json({
      msg: "Tạo token thành công",
      data: {
        accessToken,
      },
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Lỗi phía server",
    });
  }
};
// Google Auth
export const googleAuth = async (req, res) => {
  const { id_token } = req.body;

  if (!id_token) {
    return res.status(400).json({ msg: "ID token is required" });
  }

  try {
    // Xác thực token từ Google
    const decodedUser = await getAuth().verifyIdToken(id_token);

    const { email, name, picture } = decodedUser;

    let user = await User.findOne({ "personal_info.email": email });

    // Nếu user đã tồn tại
    if (user) {
      if (!user.google_auth) {
        return res.status(400).json({
          msg: "Email này đã được đăng ký bằng mật khẩu. Hãy đăng nhập bằng phương thức truyền thống.",
        });
      }

      const accessToken = generateAccessToken(
        user._id,
        user.personal_info.role
      );
      const refreshToken = generateRefreshToken(
        user._id,
        user.personal_info.role
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
      });

      return res.status(200).json({
        msg: "Đăng nhập Google thành công",
        data: {
          accessToken,
          profile_img: user.personal_info.profile_img,
          username: user.personal_info.username,
          email: user.personal_info.email,
        },
      });
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

    const accessToken = generateAccessToken(
      savedUser._id,
      savedUser.personal_info.role
    );
    const refreshToken = generateRefreshToken(
      savedUser._id,
      savedUser.personal_info.role
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // false trong local
      sameSite: "strict",
    });

    return res.status(200).json({
      msg: "Đăng ký Google thành công",
      data: {
        accessToken,
        profile_img: savedUser.personal_info.profile_img,
        username: savedUser.personal_info.username,
        email: savedUser.personal_info.email,
      },
    });
  } catch (error) {
    console.error("❌ Google Auth error:", error);

    return res.status(500).json({
      msg: "Google authentication failed",
      error: error.message || error.toString(),
    });
  }
};
