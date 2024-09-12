import express from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller";
import { verifyJwt } from "../middlewares/authMiddleware";
const userRouter = express.Router();

userRouter.route("/register-user").post(registerUser);
userRouter.route("/login-user").post(loginUser);
userRouter.route("/logout-user/:id").post(verifyJwt, logoutUser);

export default userRouter;
