import { Schema, model } from "mongoose";
import _ from "lodash";
import jwt from "jsonwebtoken";
import * as crypto from "crypto";

const JWT_SECRET = "thisisaseasda12%&%&%&27g7asd76&^sdkajsdabsdk";
const StudentSchema = new Schema({
  name: {
    type: String,
    required: true,
    minlength: 4,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    validate: {
      validator: (v: string) => {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: "Please enter a valid email",
    },
    required: [true, "Email required"],
  },
  password: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => {
        return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(
          v
        );
      },
      message:
        "Password must contain Minimum eight characters, at least one letter, one number and one special character:",
    },
  },
  sessions: [
    {
      token: {
        type: String,
        required: true,
      },
      expiresAt: {
        type: Number,
        required: true,
      },
    },
  ],
});

// Instance methods

StudentSchema.methods.toJSON = function () {
  const student = this;
  const studentObject = student.toObject();
  return _.omit(studentObject, ["password", "sessions"]);
};

StudentSchema.methods.generateAccessAuthToken = async function () {
  const student = this;
  return new Promise((resolve, reject) => {
    jwt.sign(
      { _id: student._id.toHexString() },
      JWT_SECRET,
      { expiresIn: "15m" },
      (err, token) => {
        if (!err) {
          resolve(token);
        } else {
          reject();
        }
      }
    );
  });
};
StudentSchema.methods.generateRefreshAuthToken = async function () {
  const student = this;
  return new Promise((resolve, reject) => {
    crypto.randomBytes(64, (err, buf) => {
      if (!err) {
        let token = buf.toString("hex");
        return resolve(token);
      }
    });
  });
};
StudentSchema.methods.createSession = async function () {
  let student = this;
  return student
    .generateRefreshAuthToken()
    .then((refreshToken) => {
      return saveSessionToDatabase(student, refreshToken);
    })
    .then((refreshToken) => {
      return refreshToken;
    })
    .catch((e) => {
      return Promise.reject("Failed to save session to database.\n" + e);
    });
};

// Helper methods
let saveSessionToDatabase = async (student, refreshToken) => {
  // Save the session to the database
  return new Promise(async (resolve, reject) => {
    let expiresAt = generateRefreshTokenExpiryTime();
    student.sessions.push({ token: refreshToken, expiresAt });
    student
      .save()
      .then(() => {
        // saved session successfully
        return resolve(refreshToken);
      })
      .catch((e) => {
        reject(e);
      });
  });
};
let generateRefreshTokenExpiryTime = async () => {
  let daysUntilExpire = 15;
  let secondsUntilExpire = daysUntilExpire * 24 * 60 * 60;
  return Date.now() / 1000 + secondsUntilExpire;
};

export const Student = model("Student", StudentSchema);
