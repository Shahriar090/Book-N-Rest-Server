import { Request, Response } from "express";
import { User } from "../models/user.model";
import { ApiError } from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/cloudinary";

// access and refresh token generating method
const generateAccessAndRefreshToken = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User Not Found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    // saving refresh token to DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something Went Wrong While Generating Access And Refresh Token"
    );
  }
};

// User registration------------------------------------------------

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

  // file handling
  const avatarLocalPath = req.file;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar Image Is Required");
  }

  const cloudinaryResponse = await uploadOnCloudinary(avatarLocalPath.path);

  //   creating new user

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    avatarImage: cloudinaryResponse,
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

// User login--------------------------------------------------------

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
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Credentials");
  }

  // generating access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  // removing password and refresh token before sending response
  const loggedInUser = await User.findById(user._id).select(
    "-refreshToken -password"
  );

  const options = { httpOnly: true, secure: true };

  // sending the access and refresh token with the response due to some additional considerations, such as the ability to store them in local storage.
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User Login Successful"
      )
    );
});

// User logout ----------------------------------------------
const logoutUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    await User.findByIdAndUpdate(
      req.user?._id,
      {
        $unset: {
          refreshToken: 1,
        },
      },
      { new: true }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User Logout Successful"));
  }
);

// Getting new access token using refresh token -------------------------------

const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request - Missing Refresh Token");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    );

    if (typeof decodedToken === "string") {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    // Verify the refresh token stored in the database matches the incoming one

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh Token Is Expired Or Used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    // Generate new tokens

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access Token Refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Invalid Refresh Token");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
