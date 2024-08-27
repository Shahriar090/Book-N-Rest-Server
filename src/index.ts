import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";

const app = express();
const port = 3000;

// connecting db
mongoose.connect(process.env.DB_CONNECTION_URL as string);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/api/test", async (req, res) => {
  res.json({ message: "Hello From Book-N-Rest Server" });
});

app.listen(port, () => {
  console.log(`Book-N-Rest Server Is Running On Port: ${port}`);
});
