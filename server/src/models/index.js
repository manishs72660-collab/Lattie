import mongoose from "mongoose";
const { Schema, model } = mongoose;

export const User = model(
  "User",
  new Schema(
    {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      password: { type: String, required: true, select: false },
    },
    { timestamps: true }
  )
);
