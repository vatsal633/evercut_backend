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
  location: {
    type: {
      type: String, // "Point"
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },

  createdAt: { type: Date, default: Date.now },
});

//add 2dsphere it creates a geospatial index on the location field 
userSchema.index({ location: "2dsphere" });

export default mongoose.model("User", userSchema);
