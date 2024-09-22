import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (
  localFilePath: string
): Promise<string | UploadApiResponse> => {
  try {
    if (!localFilePath) {
      return "No Local File Found";
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("File Uploaded On Cloudinary", response.url);
    fs.unlink(localFilePath, (err) => {
      if (err) {
        console.log("Error Deleting Local File", err);
      } else {
        console.log("Local File Deleted Successfully");
      }
    });
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return "File Uploading Failed";
  }
};
