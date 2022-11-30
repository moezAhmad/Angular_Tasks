import mongoose, { Schema, model } from "mongoose";
import _ from "lodash";
import jwt from "jsonwebtoken";
import * as crypto from "crypto";
import bcrypt from "bcrypt";

interface StudentDocument extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  sessions: [
    {
      token: string;
      expiresAt: number;
    }
  ];
  toJSON: () => any;
  generateAccessAuthToken: () => Promise<string>;
  generateRefreshAuthToken: () => Promise<string>;
  createSession: () => Promise<string>;
}

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

    required: [true, "Email required"],
  },
  password: {
    type: String,
    required: true,
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

// *** Instance methods ***

StudentSchema.methods.toJSON = function () {
  const Student = this;
  const StudentObject = Student.toObject();

  // return the document except the password and sessions (these shouldn't be made available)
  return _.omit(StudentObject, ["password", "sessions"]);
};

StudentSchema.methods.generateAccessAuthToken = function () {
  const Student = this;
  return new Promise((resolve, reject) => {
    // Create the JSON Web Token and return that
    jwt.sign(
      { _id: Student._id.toHexString() },
      JWT_SECRET,
      { expiresIn: "20m" },
      (err, token) => {
        if (!err) {
          resolve(token);
        } else {
          // there is an error
          reject({ error: "Could not generate access token" });
        }
      }
    );
  });
};

StudentSchema.methods.generateRefreshAuthToken = function () {
  // This method simply generates a 64byte hex string - it doesn't save it to the database. saveSessionToDatabase() does that.
  return new Promise((resolve, reject) => {
    crypto.randomBytes(64, (err, buf) => {
      if (!err) {
        // no error
        let token = buf.toString("hex");

        return resolve(token);
      }
    });
  });
};

StudentSchema.methods.createSession = function () {
  let student = this;

  return student
    .generateRefreshAuthToken()
    .then((refreshToken: string) => {
      return saveSessionToDatabase(student, refreshToken);
    })
    .then((refreshToken: string) => {
      // saved to database successfully
      // now return the refresh token
      return refreshToken;
    })
    .catch((e: string) => {
      return Promise.reject({
        error: "Failed to save session to database.\n" + e,
      });
    });
};

/* MODEL METHODS (static methods) */

StudentSchema.statics.getJWTSecret = () => {
  return JWT_SECRET;
};

StudentSchema.statics.findByIdAndToken = function (_id, token) {
  // finds Student by id and token
  // used in auth middleware (verifySession)

  const Student = this;

  return Student.findOne({
    _id,
    "sessions.token": token,
  });
};

StudentSchema.statics.findByCredentials = function (email, password) {
  let Student = this;
  return Student.findOne({ email }).then((student: any) => {
    if (!student) return Promise.reject({ error: "Could not find student" });

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, student.password, (err, res) => {
        if (res) {
          resolve(student);
        } else {
          reject({ error: "Password Donot match" });
        }
      });
    });
  });
};

StudentSchema.statics.hasRefreshTokenExpired = (expiresAt) => {
  let secondsSinceEpoch = Date.now() / 1000;
  if (expiresAt > secondsSinceEpoch) {
    // hasn't expired
    return false;
  } else {
    // has expired
    return true;
  }
};

/* MIDDLEWARE */
// Before a user document is saved, this code runs
StudentSchema.pre("save", function (next) {
  let student = this;
  let costFactor = 10;

  if (student.isModified("password")) {
    // if the password field has been edited/changed then run this code.

    // Generate salt and hash password
    bcrypt.genSalt(costFactor, (err, salt) => {
      bcrypt.hash(student.password, salt, (err, hash) => {
        student.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

/* HELPER METHODS */
let saveSessionToDatabase = (student: any, refreshToken: any) => {
  // Save session to database
  return new Promise((resolve, reject) => {
    let expiresAt = generateRefreshTokenExpiryTime();

    student.sessions.push({ token: refreshToken, expiresAt });

    student
      .save()
      .then(() => {
        // saved session successfully
        return resolve(refreshToken);
      })
      .catch((e: any) => {
        reject(e);
      });
  });
};

let generateRefreshTokenExpiryTime = () => {
  let daysUntilExpire = 10;
  let secondsUntilExpire = daysUntilExpire * 24 * 60 * 60;
  return Date.now() / 1000 + secondsUntilExpire;
};

export const Student = model<StudentDocument>("Student", StudentSchema);
