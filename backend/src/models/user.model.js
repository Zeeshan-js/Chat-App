import mongoose, { Schema } from "mongoose";
import { AvailableRoles, UserRolesEnum } from "../constants.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please create a password password"],
    },
    avatar: {
      type: {
        url: String, // cloudinary URL
        localPath: String
      },
      default: {
        url: "",
        localPath: ""
      }
    },
    role: {
      type: String,
      enum: AvailableRoles,
      default: UserRolesEnum.USER,
      required: true,
    },
    refreshToken: {
      type: String
    }
  },
  { timestamps: true }
);

// generate Access Token for user
userSchema.methods.generateAccessToken = function () {
  try {
    return jwt.sign(
      {
        _id: this._id,
        username: this.username,
        email: this.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.EXPIRE_ACCESS_TOKEN,
      }
    );
  } catch (error) {
    throw new ApiError(
      401, error
    )
  }
};

// generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.EXPIRE_REFRESH_TOKEN,
    }
  );
};

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return
    this.password = await bcrypt.hash(this.password, 10)
    
  if (!this.avatar || !this.avatar.url) {
    this.avatar = {
      url: "user.avif",
      localPath: "./public/temp"
    }
  }
  next()

})


userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password)
}

export const User = mongoose.model("User", userSchema);
