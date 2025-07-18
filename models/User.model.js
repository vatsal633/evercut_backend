import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  photoUrl: { type: String },
  cloudinaryId: { type: String },
  phoneNumber: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  dateOfBirth: { type: Date, required: true },
  address: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
