import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { User, UserType } from "../models/user.model";

export interface AuthenticatedRequest extends Request {
  user?: UserType;
}

export const verifyJwt = asyncHandler(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.accessToken;

      if (!token) {
        res
          .status(401)
          .json(new ApiError(401, "Unauthorized Request.No Token Found"));
        return;
      }

      const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
      );

      if (typeof decodedToken === "string") {
        res.status(401).json(new ApiError(401, "Invalid Access Token"));
        return;
      }

      const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken"
      );

      if (!user) {
        res
          .status(401)
          .json(new ApiError(401, "Invalid Access Token, No User Found"));
        return;
      }

      req.user = user!;
      next();
    } catch (error) {
      res.status(401).json(new ApiError(401, "Invalid Access Token"));
      return;
    }
  }
);
