import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { User, UserType } from "../models/user.model";

interface AuthenticatedRequest extends Request {
  user?: UserType;
}

export const verifyJwt = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.accessToken;

      if (!token) {
        throw new ApiError(401, "Unauthorized Request");
      }

      const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
      );

      if (typeof decodedToken === "string") {
        throw new ApiError(401, "Invalid Access Token");
      }

      const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken"
      );

      if (!user) {
        throw new ApiError(401, "Invalid Access Token");
      }

      req.user = user;
      next();
    } catch (error) {
      throw new ApiError(401, "Invalid Access Token");
    }
  }
);
