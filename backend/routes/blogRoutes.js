import express from "express";
import {
  createBlog,
  latestBlog,
  trendingBlogs,
  searchBlogs,
  getBlog,
  deleteBlog,
  updateBlog,
  getByUsername,
  getDraftsByUsername,
  getAllBlogs,
  likeBlog,
} from "../controllers/blogController.js";
import { verifyAccessToken } from "../middleware/jwt.js";
import { checkRole } from "../middleware/checkRole.js";

const router = express.Router();

// Blog routes
router.post("/create-blog", verifyAccessToken, createBlog);
router.post("/search-blogs", searchBlogs);
router.post("/get-blog", getBlog);
router.get(
  "/get-all-blogs",
  verifyAccessToken,
  checkRole("admin"),
  getAllBlogs
);
router.get("/get-by-username", getByUsername);
router.get("/get-drafts-by-username", getDraftsByUsername);
router.get("/latest-blogs", latestBlog);
router.get("/trending-blogs", trendingBlogs);
router.put("/update-blog/:id", updateBlog);
router.delete("/delete-blog/:blog_id", verifyAccessToken, deleteBlog);
router.post("/like-blog", verifyAccessToken, likeBlog);

export default router;
