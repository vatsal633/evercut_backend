import User from '../../../models/User.model.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../../config/cloudinary.js';
import multer from 'multer';

export const checkUserAfterOTP = async (req, res) => {
  const { firebaseUid, phone_number } = req.firebaseUser;

  try {
    let user = await User.findOne({ firebaseUid });

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
        firebaseUid,
        phoneNumber: phone_number,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error checking user' });
  }
};



// user photo storage: evercut/<firebaseUid>/employees
const userPhotoStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    if (!req.firebaseUser || !req.firebaseUser.firebaseUid) {
      throw new Error('firebaseUser or firebaseUid missing in request. Make sure verifyToken middleware runs before multer.');
    }
    return {
      folder: `evercut/users/Photo/${req.firebaseUser.firebaseUid}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 800, height: 800, crop: 'limit' }]
    };
  }
});

export const uploadUserPhoto = multer({ storage: userPhotoStorage });


export const completeProfile = async (req, res) => {
  // const file = req.file;
  const {
    phoneNumber,
    firstName,
    lastName,
    gender,
    dateOfBirth,
    address,
    location: locationString,
    email,
  } = req.body;

  // Always use firebaseUid from token
  const firebaseUid = req.firebaseUser?.firebaseUid;
  if (!firebaseUid) {
    return res.status(400).json({ error: 'firebaseUid is required (from token)' });
  }

  try {
    const existing = await User.findOne({ firebaseUid });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    // if (!file) {
    //   return res.status(400).json({ error: 'Profile photo is required' });
    // }

    // const photoUrl = file.path;
    // const cloudinaryId = file.public_id;

    let location = null;
    try {
      location = JSON.parse(locationString);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid location format' });
    }

    const user = await User.create({
      firebaseUid,
      // photoUrl,
      // cloudinaryId,
      phoneNumber,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      address,
      location,
      email,
    });

    res.status(201).json({ message: 'User profile saved', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not complete profile' });
  }
};
