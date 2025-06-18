import express from "express";
import { verifyJWT } from "../middlewares/verifyJWT";
import {
  checkNewNotification,
  getNotifications,
  countNotifications,
} from "../controllers/notification.controller";

const router = express.Router();

router.get("/new", verifyJWT, checkNewNotification);
router.post("/", verifyJWT, getNotifications);
router.post("/count", verifyJWT, countNotifications);

export default router;
