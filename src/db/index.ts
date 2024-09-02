import mongoose from "mongoose";
import { DB_NAME } from "../utils/constants";

export const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.DB_CONNECTION_URL}/${DB_NAME}`
    );
    console.log(
      `MongoDB Connected Successfully!! DB HOST:${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MongoDB Connection Failed", error);
    process.exit(1);
  }
};
