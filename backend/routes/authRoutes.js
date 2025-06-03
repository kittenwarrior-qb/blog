import express from "express";
import {
  register,
  login,
  googleAuth,
  getUploadUrl,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google-auth", googleAuth);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/get-upload-url", getUploadUrl);

export default router;
