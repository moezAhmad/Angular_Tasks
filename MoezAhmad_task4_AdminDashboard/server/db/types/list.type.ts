import { Schema, model, Types } from "mongoose";

const ListSchema = new Schema({
  title: {
    type: String,
    required: true,
    minlength: 4,
    trim: true,
  },
});
export const List = model("List", ListSchema);
