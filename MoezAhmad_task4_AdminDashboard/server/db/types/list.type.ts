import { Schema, model, Types } from "mongoose";

const ListSchema = new Schema({
  title: {
    type: String,
    required: true,
    minlength: 4,
    trim: true,
  },
  _studentId: {
    type: Types.ObjectId,
    required: true,
  },
});
export const List = model("List", ListSchema);
