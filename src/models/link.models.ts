import { model, Schema, Types } from "mongoose";

interface ILink {
  hash: string;
  userId: Types.ObjectId;
}

const LinkSchema = new Schema<ILink>({
  hash: String,
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
});

export const LinkModel = model("Links", LinkSchema);
