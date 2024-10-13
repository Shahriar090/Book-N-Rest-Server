import express from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateUser,
} from "../controllers/user.controller";
import { verifyJwt } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/multerMiddleware";
const userRouter = express.Router();

userRouter
  .route("/register-user")
  .post(upload.single("avatarImage"), registerUser);
userRouter.route("/login-user").post(loginUser);
userRouter.route("/logout-user/:id").post(verifyJwt, logoutUser);
userRouter.route("/refresh-access-token").post(refreshAccessToken);
userRouter
  .route("/update-user/:userId")
  .patch(verifyJwt, upload.single("avatarImage"), updateUser);

export default userRouter;
