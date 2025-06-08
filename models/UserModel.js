import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseUid: String,
  phoneNumber: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  gender: String,
  dateOfBirth: String,
  address: String,
  email: String,
});

const User = mongoose.model('User', userSchema);

export default User;
