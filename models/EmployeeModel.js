// models/EmployeeModel.js
import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true },  //  barber's uid (owner)
  photoUrl: { type: String }, // Cloudinary image URL
  cloudinaryId: { type: String }, // Cloudinary public ID for deletion// 
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthDate: { type: String, required: true },
  gender: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  workingHours: { startingTime: String, endingTime: String },
  bookingSlots: [{ date: String, time: String }],
  blockedDates: [Date],
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
}, { timestamps: true });


export default mongoose.model('Employee', employeeSchema);



