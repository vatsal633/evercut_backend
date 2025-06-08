// models/EmployeeModel.js
import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true }, // barber's uid (owner)
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  birthDate: { type: String, required: true },
  gender: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
}, { timestamps: true });


export default mongoose.model('Employee', employeeSchema);



