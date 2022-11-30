import { Schema, model, Types } from "mongoose";

const TaskSchema = new Schema({
  title: {
    type: String,
    required: true,
    minlength: 4,
    trim: true,
  },
  _listId: {
    type: Types.ObjectId,
    required: true,
  },
  _studentId: {
    type: Types.ObjectId,
    required: true,
  },
});
export const Task = model("Task", TaskSchema);
