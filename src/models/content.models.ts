import { model, Schema, Types } from "mongoose";

interface IContent {
  title: string;
  link: string;
  tags: Types.ObjectId[];
  type: string;
  userId: Types.ObjectId;
}

const ContentSchema = new Schema<IContent>(
  {
    title: String,
    link: String,
    tags: [{ type: Schema.Types.ObjectId, ref: "Tags" }],
    type: String,
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

export const ContentModel = model("Content", ContentSchema);
