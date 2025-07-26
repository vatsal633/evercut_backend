import mongoose from "mongoose";
import breakTimeSchema from "./schemas/BreakTime.schema.js";

const barberSetupSchema = new mongoose.Schema({
  // Step 1 - Basic Info
  firebaseUid: { type: String, required: true, unique: true },
  shopName: { type: String, required: true },
  numberOfEmployees: { type: Number, required: true },
  yearsOfExperience: { type: Number, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  shopOwner: { type: String, required: true },
  emailId: { type: String, required: true },
  upiId: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  address:{type:String,required:true},

  bio: { type: String },

  // Shop Cover Image
  coverUrl: { type: String },
  coverCloudinaryId: { type: String },

  // Step 2 - Shop Type
  shopCategory: {
    type: String,
    enum: ["Salon", "Beauty Parlour", "Barber", "Door-Step"],
    required: true,
  },
  facilities: [String],

  // Step 3 - Time & Availability
  availableDays: [String],
  openTime: String,
  closeTime: String,
  breakTimes: [breakTimeSchema],

  // Step 4 - Set PIN
  pin: { type: String, required: true },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
barberSetupSchema.index({ location: "2dsphere" });

export default mongoose.model("BarberSetup", barberSetupSchema);
