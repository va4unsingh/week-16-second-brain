import mongoose from "mongoose";


const connectDB = async (): Promise<void> => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }
    const db = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`\n MongoDB connected !! DB HOST:${db.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error ", error);
    process.exit(1);
  }
};

export default connectDB;
