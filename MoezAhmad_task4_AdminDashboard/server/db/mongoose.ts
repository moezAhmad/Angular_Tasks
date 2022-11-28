//This file will handle Connection logic to MongoDB

import mongoose from "mongoose";
mongoose.Promise = global.Promise;

console.log("Connecting to MongoDB");
mongoose
  .connect("mongodb://localhost:27017/TaskManager", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
  } as mongoose.ConnectOptions)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((e) => {
    console.log("Unable to connect to MongoDB");
    console.log(e);
  });

export { mongoose };
