import express from "express";
import {
  register,
  login,
  googleAuth,
  getUploadUrl,
  forgotPassword,
  resetPassword,
  getProfile,
  logout,
  getAllUsers,
  uploadProfileImage,
  uploadProfile,
} from "../controllers/authController.js";
import { refreshToken } from "firebase-admin/app";
import { verifyAccessToken } from "../middleware/jwt.js";
import { checkRole } from "../middleware/checkRole.js";

const router = express.Router();

router.get("/get-upload-url", getUploadUrl);
router.get("/get-profile", getProfile);
router.get(
  "/get-all-users",
  // verifyAccessToken,
  // checkRole("admin"),
  getAllUsers
);
router.post("/register", register);
router.post("/login", login);
router.post("/google-auth", googleAuth);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh-token", refreshToken);
router.delete("/logout", logout);
router.post("/update-profile-img", verifyAccessToken, uploadProfileImage);
router.post("/update-profile", verifyAccessToken, uploadProfile);

export default router;
