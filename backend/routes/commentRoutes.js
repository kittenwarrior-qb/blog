import express from "express";
import { verifyJWT } from "../middlewares/verifyJWT";
import {
  addCommentController,
  getBlogCommentsController,
  getRepliesController,
  deleteCommentController,
} from "../controllers/comment.controller";

const router = express.Router();

router.post("/add-comment", verifyJWT, addCommentController);
router.post("/get-blog-comments", getBlogCommentsController);
router.post("/get-replies", getRepliesController);
router.post("/delete-comment", verifyJWT, deleteCommentController);

export default router;
