import User from '../../../models/User.model.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../../config/cloudinary.js';
import multer from 'multer';

export const checkUserAfterOTP = async (req, res) => {
  const {firebaseUid, phone_number } = req.firebaseUser;

  try {
    let user = await User.findOne({ firebaseUid});

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
const userPhotoStorage = new CloudinaryStorage(
  {
  cloudinary,
  params: (req, file) => ({
    // folder: `evercut/${req.firebaseUser.firebaseUid}/employees`,
    folder: `evercut/users/Photo/${req.firebaseUser.firebaseUid}`, // Dynamic folder per barber
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  })
});

export const uploadUserPhoto = multer({ storage: userPhotoStorage });


export const completeProfile = async (req, res) => {

  const file = req.file;
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
    let photoUrl = '';
    let cloudinaryId = '';
    if (file) {
      photoUrl = file.path;
      cloudinaryId = file.public_id;
    }

    const user = await User.create({
      firebaseUid,
      photoUrl,
      cloudinaryId,
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
