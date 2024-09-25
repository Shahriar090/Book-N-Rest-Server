import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log(cloudinary.config);
export const uploadOnCloudinary = async (
  localFilePath: string
): Promise<string | UploadApiResponse> => {
  // console.log(
  //   "local file path from cloudinary middleware first line",
  //   localFilePath
  // );
  try {
    if (!localFilePath) {
      return "No Local File Found";
    }

    console.log(localFilePath, "before cloudinary response");
    const response = await cloudinary?.uploader?.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log(response, "Response From Cloudinary");
    console.log("File Uploaded On Cloudinary", response.url);
    fs.unlink(localFilePath, (err) => {
      if (err) {
        console.log("Error Deleting Local File", err);
      } else {
        console.log("Local File Deleted Successfully");
      }
    });
    return response?.url;
  } catch (error) {
    console.log(error, "Error From Cloudinary");
    fs.unlinkSync(localFilePath);
    return "File Uploading Failed";
  }
};
