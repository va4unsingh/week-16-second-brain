import { model, Schema, Types } from "mongoose";

interface ITags {
  title: string;
}

const TagsSchema = new Schema<ITags>({
  title: String,
});

export const TagsModel = model("Tags", TagsSchema);
