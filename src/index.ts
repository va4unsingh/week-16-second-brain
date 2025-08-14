import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route";
import connectDB from "./db/db";

const app = express();
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const port = process.env.PORT || 4000;

connectDB();

app.post("/", (req, res) => {
  res.json({ message: "Test works!" });
});

app.use("/api/v1", userRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
