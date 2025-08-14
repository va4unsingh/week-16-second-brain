import { Router } from "express";
import { userMiddleware } from "../middlewares/middleware";
import {
  deleteContent,
  getContent,
  shareContent,
  shareLinkContent,
  signIn,
  signUp,
  uploadContent,
} from "../controllers/user.controller";

const router = Router();

router.route("/signUp").post(signUp);
router.route("/signIn").post(signIn);
router.route("/content").post(userMiddleware, uploadContent);
router.route("/content").get(userMiddleware, getContent);
router.route("/content").delete(userMiddleware, deleteContent);
router.route("/brain/share").post(userMiddleware, shareContent);
router.route("/brain/:shareLink").get(userMiddleware, shareLinkContent);

export default router;
