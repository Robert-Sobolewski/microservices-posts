import mongoose, { PassportLocalModel } from "mongoose";
import express from "express";
import bcrypt from "bcrypt";
import passportLocalMongoose from "passport-local-mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    default: "user",
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

// define pre-save hook to hash password

// userSchema.pre("save", async function (this: any, next: express.NextFunction) {
//   if (this.isModified("password")) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });

// // define method to check password
userSchema.methods.isCorrectPassword = async function () {
  return await bcrypt.compare(this.password, this.password);
};

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema) as PassportLocalModel<any>;
export default User;
