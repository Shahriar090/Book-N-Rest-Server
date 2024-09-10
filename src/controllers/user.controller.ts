import ApiResponse from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const registerUser = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, {}, "User Registered Successful"));
});

export { registerUser };
