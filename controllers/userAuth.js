// controllers/userAuth.js - Updated with profile update functionality
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

// 🆕 NEW: Get user profile
export const getUserProfile = async (req, res) => {
  const { uid } = req.firebaseUser;

  try {
    const user = await User.findOne({ firebaseUid: uid });
    
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.status(200).json({
      message: 'User profile retrieved successfully',
      user
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Error fetching user profile' });
  }
};

// 🆕 NEW: Update user profile
export const updateUserProfile = async (req, res) => {
  const { uid } = req.firebaseUser;
  
  // Debug logging
  console.log('=== UPDATE PROFILE DEBUG ===');
  console.log('Firebase UID:', uid);
  console.log('Request body:', req.body);
  console.log('============================');

  const {
    firstName,
    lastName,
    gender,
    dateOfBirth,
    address,
    email,
  } = req.body;

  try {
    // Check if user exists
    const existingUser = await User.findOne({ firebaseUid: uid });
    if (!existingUser) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Validate input - at least one field should be provided
    const updateFields = {
      firstName,
      lastName,
      gender,
      dateOfBirth,
      address,
      email,
    };

    // Remove undefined fields
    const filteredUpdateFields = Object.entries(updateFields)
      .filter(([key, value]) => value !== undefined && value !== null && value !== '')
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});

    if (Object.keys(filteredUpdateFields).length === 0) {
      return res.status(400).json({ 
        error: 'At least one field is required to update profile' 
      });
    }

    // Email validation if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    // Update user profile
    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid: uid },
      filteredUpdateFields,
      { 
        new: true, // Return updated document
        runValidators: true // Run mongoose validators
      }
    );

    res.status(200).json({
      message: 'User profile updated successfully',
      user: updatedUser
    });

  } catch (err) {
    console.error('Error updating user profile:', err);
    
    // Handle specific errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        error: 'Validation error', 
        details: errors 
      });
    }

    if (err.code === 11000) {
      // Duplicate key error
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({ 
        error: `${field} already exists. Please use a different ${field}.` 
      });
    }

    res.status(500).json({ error: 'Error updating user profile' });
  }
};

// 🆕 NEW: Partial profile update (for specific fields only)
export const updateSpecificField = async (req, res) => {
  const { uid } = req.firebaseUser;
  const { field, value } = req.body;

  try {
    // Validate allowed fields
    const allowedFields = ['firstName', 'lastName', 'gender', 'dateOfBirth', 'address', 'email'];
    
    if (!allowedFields.includes(field)) {
      return res.status(400).json({ 
        error: 'Invalid field. Allowed fields: ' + allowedFields.join(', ') 
      });
    }

    if (value === undefined || value === null || value === '') {
      return res.status(400).json({ error: 'Field value is required' });
    }

    // Special validation for email
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
    }

    // Check if user exists
    const existingUser = await User.findOne({ firebaseUid: uid });
    if (!existingUser) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Update specific field
    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid: uid },
      { [field]: value },
      { 
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      message: `${field} updated successfully`,
      user: updatedUser
    });

  } catch (err) {
    console.error('Error updating specific field:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        error: `${field} already exists. Please use a different value.` 
      });
    }

    res.status(500).json({ error: `Error updating ${field}` });
  }
};