import mongoose from "mongoose";

mongoose
  .connect(
    "mongodb+srv://varunsingh7004:vader@cluster0.bznjjdn.mongodb.net/varunsingh"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
