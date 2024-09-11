import { Request, Response } from "express";
import { User } from "../models/user.model";
import { ApiError } from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

// User registration

const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;
  //   fields validation
  if (
    [firstName, lastName, email, password].some(
      (field) => !field || field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All Fields Are Required");
  }

  //  checking if the user already exists or not

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new ApiError(409, "This User Already Exist");
  }

  //   creating new user

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
  });

  //   removing password and refresh token from newly created user's information

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something Went Wrong While Creating This User");
  }

  // sending response

  res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User Created Successfully"));
});

// User login

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // validation
  if (!email && !password) {
    throw new ApiError(400, "Email And Password Are Required");
  }

  // find the user
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, "User Does Not Exist");
  }

  // checking the password
  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid User Credentials");
  }
});

export { registerUser, loginUser };
