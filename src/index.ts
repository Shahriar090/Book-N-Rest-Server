import dotenv from "dotenv";
import { connectDb } from "./db";
import { app } from "./app";
dotenv.config({ path: "./.env" });

// connecting db
connectDb()
  .then(() => {
    app.listen(process.env.PORT || 4000, () => {
      console.log(`Server Is Running At Port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB Connection Failed", err);
  });

app.get("/api/test", async (req, res) => {
  res.json({ message: "Hello From Book-N-Rest Server" });
});
