import admin from '../firebaseService.js';
import User from '../models/UserModel.js';

export const checkUserAfterOTP = async (req, res) => {
  const { uid, phone_number } = req.firebaseUser;

  try {
    let user = await User.findOne({ firebaseUid: uid });

    if (user) {
      // Existing user - login
      console.log("existing user")
      return res.status(200).json({
        message: 'Login successful',
        user,
        isNewUser: false,
      });
    } else {
      // New user - needs to fill form
      console.log("new user")
      return res.status(200).json({
        message: 'New user, complete profile',
        isNewUser: true,
        firebaseUid: uid,
        phoneNumber: phone_number,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error checking user' });
  }
};

export const completeProfile = async (req, res) => {
  const {
    firebaseUid,
    phoneNumber,
    firstName,
    lastName,
    gender,
    dateOfBirth,
    address,
    email,
  } = req.body;

  try {
    const existing = await User.findOne({ firebaseUid });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const user = await User.create({
      firebaseUid,
      phoneNumber,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      address,
      email,
    });

    res.status(201).json({ message: 'User profile saved', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not complete profile' });
  }
};
