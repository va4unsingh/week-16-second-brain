import mongoose, { model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

interface IUser {
  username: string;
  password: string; // no undefined/null
}

const UserSchema = new Schema<IUser>({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

UserSchema.pre<IUser & mongoose.Document>("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export const UserModel = model("User", UserSchema);
