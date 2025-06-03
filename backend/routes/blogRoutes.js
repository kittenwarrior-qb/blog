import express from "express";
import {
  createBlog,
  latestBlog,
  trendingBlogs,
  searchBlogs,
  getBlog,
  deleteBlog,
  updateBlog,
} from "../controllers/blogController.js";
import verifyJWT from "../middleware/verifyJWT.js";

const router = express.Router();

// Blog routes
router.post("/create-blog", verifyJWT, createBlog);
router.post("/search-blogs", searchBlogs);
router.post("/get-blog", getBlog);
router.get("/latest-blogs", latestBlog);
router.get("/trending-blogs", trendingBlogs);
router.put("/update-blog/:id", verifyJWT, updateBlog);
router.delete("/delete-blog", verifyJWT, deleteBlog);

export default router;
