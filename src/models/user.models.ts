import { model, Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

// Shape of a User's stored data
interface IUser extends Document {
  username: string;
  password: string; // stored as a hash
}

// User schema definition
const UserSchema = new Schema<IUser>(
  {
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true, select: false },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Pre-save hook to hash password if modified
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// User model
export const UserModel = model("User", UserSchema);
