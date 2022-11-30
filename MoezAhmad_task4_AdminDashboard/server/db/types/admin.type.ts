import mongoose, { Schema, model } from "mongoose";
import _ from "lodash";
import jwt from "jsonwebtoken";
import * as crypto from "crypto";
import bcrypt from "bcrypt";

interface AdminDocument extends mongoose.Document {
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
  hasRefreshTokenExpired: (expiresAt: number) => boolean;
}

const JWT_SECRET =
  "thisasjdljasldn%%712836isaseasda12%&%&%&27g7asd76&^sdkajsdabsdk";
const AdminSchema = new Schema({
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
    required: [true, "Password required"],
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

AdminSchema.methods.toJSON = function () {
  const admin = this;
  const adminObject = admin.toObject();

  // return the document except the password and sessions (these shouldn't be made available)
  return _.omit(adminObject, ["password", "sessions"]);
};

AdminSchema.methods.generateAccessAuthToken = function () {
  const admin = this;
  return new Promise((resolve, reject) => {
    // Create the JSON Web Token and return that
    jwt.sign(
      { _id: admin._id.toHexString() },
      JWT_SECRET,
      { expiresIn: "15m" },
      (err, token) => {
        if (!err) {
          resolve(token);
        } else {
          // there is an error
          reject("Failed to generate access token");
        }
      }
    );
  });
};

AdminSchema.methods.generateRefreshAuthToken = function () {
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

AdminSchema.methods.createSession = function () {
  let admin = this;

  return admin
    .generateRefreshAuthToken()
    .then((refreshToken: string) => {
      return saveSessionToDatabase(admin, refreshToken);
    })
    .then((refreshToken: string) => {
      // saved to database successfully
      // now return the refresh token
      return refreshToken;
    })
    .catch((e: string) => {
      return Promise.reject("Failed to save session to database.\n" + e);
    });
};

/* MODEL METHODS (static methods) */

AdminSchema.statics.getJWTSecret = () => {
  return JWT_SECRET;
};

AdminSchema.statics.findByIdAndToken = function (_id, token) {
  // finds admin by id and token
  // used in auth middleware (verifySession)

  const admin = this;
  return admin.findOne({
    _id,
    "sessions.token": token,
  });
};

AdminSchema.statics.findByCredentials = function (email, password) {
  let admin = this;

  return admin.findOne({ email }).then((admin: any) => {
    if (!admin) return Promise.reject("Admin not found");

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, admin.password, (err, res) => {
        if (res) {
          resolve(admin);
        } else {
          reject("Incorrect password");
        }
      });
    });
  });
};

AdminSchema.statics.hasRefreshTokenExpired = (expiresAt) => {
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
AdminSchema.pre("save", function (next) {
  let admin = this;
  let costFactor = 10;

  if (admin.isModified("password")) {
    // if the password field has been edited/changed then run this code.

    // Generate salt and hash password
    bcrypt.genSalt(costFactor, (err, salt) => {
      bcrypt.hash(admin.password, salt, (err, hash) => {
        admin.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

/* HELPER METHODS */
let saveSessionToDatabase = (admin: any, refreshToken: any) => {
  // Save session to database
  return new Promise((resolve, reject) => {
    let expiresAt = generateRefreshTokenExpiryTime();

    admin.sessions.push({ token: refreshToken, expiresAt });

    admin
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

export const Admin = model<AdminDocument>("Admin", AdminSchema);
