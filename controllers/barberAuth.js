// import BarberSetup from "../models/BarberSet.js";
// import bcrypt from "bcryptjs";

// export const handleBarberSetup = async (req, res) => {
//   console.log("✅ /api/barber/setup hit");

//   try {
//     const {
//       shopName,
//       numberOfEmployees,
//       yearsOfExperience,
//       upiId,
//       location,
//       bio,
//       shopCategory,
//       facilities,
//       availableDays,
//       openTime,
//       closeTime,
//       breakTimes,
//       pin,
//       confirmPin,
//     } = req.body;

//     if (pin !== confirmPin) {
//       return res.status(400).json({ message: "PINs do not match" });
//     }

//     const hashedPin = await bcrypt.hash(pin, 10);

//     const newBarber = new BarberSetup({
//       shopName,
//       numberOfEmployees,
//       yearsOfExperience,
//       upiId,
//       location,
//       bio,
//       shopCategory,
//       facilities,
//       availableDays,
//       openTime,
//       closeTime,
//       breakTimes,
//       pin: hashedPin,
//     });

//     await newBarber.save();

//     res.status(201).json({
//       message: "Barber setup completed successfully",
//       barber: newBarber,
//     });

//   } catch (error) {
//     console.error("Barber setup error:", error);
//     res.status(500).json({ message: "Server error during setup" });
//   }
// };


import BarberSetup from '../models/BarberModel.js';
// import bcrypt from 'bcryptjs';


export const checkBarberAfterOTP = async (req, res) => {
  const { uid, phone_number } = req.firebaseUser;

  try {
    const barber = await BarberSetup.findOne({ firebaseUid: uid });

    if (barber) {
      return res.status(200).json({
        message: 'Login successful',
        barber,
        isNewBarber: false,
      });
    } else {
      return res.status(200).json({
        message: 'New barber, complete profile',
        isNewBarber: true,
        firebaseUid: uid,
        phoneNumber: phone_number,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error checking barber' });
  }
};

export const completeBarberProfile = async (req, res) => {
  const {
    firebaseUid,
    phoneNumber,
    shopName,
    numberOfEmployees,
    yearsOfExperience,
    shopOwner,
    emailId,
    upiId,
    location,
    bio,
    shopCategory,
    facilities,
    availableDays,
    openTime,
    closeTime,
    breakTimes,
    pin,
    confirmPin,
  } = req.body;

  try {
    const existing = await BarberSetup.findOne({ firebaseUid });
    if (existing) {
      return res.status(400).json({ error: 'Barber already exists' });
    }

      // 2. Check if PINs match
      if (pin !== confirmPin) {
        return res.status(400).json({ message: 'PINs do not match' });
      }
  
      // 3. Hash the PIN
      // const hashedPin = await bcrypt.hash(pin, 10);

    const barber = await BarberSetup.create({
      firebaseUid,
      phoneNumber,
      shopName,
      numberOfEmployees,
      yearsOfExperience,
      shopOwner,
      emailId,
      upiId,
      location,
      bio,
      shopCategory,
      facilities,
      availableDays,
      openTime,
      closeTime,
      breakTimes,
      pin,
      confirmPin,
    });

    res.status(201).json({ message: 'Barber profile saved', barber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not complete barber profile' });
  }
};

// Update barber profile
export const updateBarberProfile = async (req, res) => {
  try {
    const { uid } = req.firebaseUser;
    
    // Validate if barber exists
    const existingBarber = await BarberSetup.findOne({ firebaseUid: uid });
    if (!existingBarber) {
      return res.status(404).json({ 
        success: false,
        message: 'Barber profile not found. Please complete your profile first.' 
      });
    }

    // Extract allowed fields for update
    const allowedFields = [
      'shopName', 'numberOfEmployees', 'yearsOfExperience', 'shopOwner', 
      'emailId', 'upiId', 'location', 'bio', 'shopCategory', 'facilities',
      'availableDays', 'openTime', 'closeTime', 'breakTimes'
    ];

    // Filter and validate update data
    const updateData = {};
    const errors = [];

    for (const [key, value] of Object.entries(req.body)) {
      if (allowedFields.includes(key)) {
        // Validate specific fields
        if (key === 'shopCategory' && value) {
          const validCategories = ["Salon", "Beauty Parlour", "Barber", "Door-Step"];
          if (!validCategories.includes(value)) {
            errors.push(`Invalid shop category. Must be one of: ${validCategories.join(', ')}`);
            continue;
          }
        }

        if (key === 'numberOfEmployees' && value !== undefined) {
          const numEmployees = parseInt(value);
          if (isNaN(numEmployees) || numEmployees < 1) {
            errors.push('Number of employees must be a positive number');
            continue;
          }
          updateData[key] = numEmployees;
        } else if (key === 'yearsOfExperience' && value !== undefined) {
          const years = parseInt(value);
          if (isNaN(years) || years < 0) {
            errors.push('Years of experience must be a non-negative number');
            continue;
          }
          updateData[key] = years;
        } else if (key === 'emailId' && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push('Invalid email format');
            continue;
          }
          updateData[key] = value;
        } else if (key === 'facilities' && Array.isArray(value)) {
          updateData[key] = value.filter(facility => facility && facility.trim());
        } else if (key === 'availableDays' && Array.isArray(value)) {
          const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          const invalidDays = value.filter(day => !validDays.includes(day));
          if (invalidDays.length > 0) {
            errors.push(`Invalid days: ${invalidDays.join(', ')}. Valid days are: ${validDays.join(', ')}`);
            continue;
          }
          updateData[key] = value;        } else if (key === 'breakTimes' && Array.isArray(value)) {
          // Validate break times format
          const validBreakTimes = value.filter(bt => 
            bt && typeof bt === 'object' && bt.start && bt.end
          );
          updateData[key] = validBreakTimes;
        } else if (key === 'location' && value) {
          // Handle location field - convert object to string if needed (since model expects string)
          if (typeof value === 'object') {
            updateData[key] = JSON.stringify(value);
          } else {
            updateData[key] = value;
          }
        } else if (value !== undefined && value !== null && value !== '') {
          updateData[key] = value;
        }
      }
    }

    // Return validation errors if any
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update'
      });
    }

    // Update the barber profile
    const updatedBarber = await BarberSetup.findOneAndUpdate(
      { firebaseUid: uid },
      { $set: updateData },
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!updatedBarber) {
      return res.status(404).json({
        success: false,
        message: 'Failed to update barber profile'
      });
    }

    // Remove sensitive data from response
    const { pin, ...safeBarberData } = updatedBarber.toObject();

    res.status(200).json({
      success: true,
      message: 'Barber profile updated successfully',
      data: {
        barber: safeBarberData,
        updatedFields: Object.keys(updateData)
      }
    });

  } catch (error) {
    console.error('Error updating barber profile:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate key error. Email or phone number already exists.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while updating profile'
    });
  }
};

// Get barber profile
export const getBarberProfile = async (req, res) => {
  try {
    const { uid } = req.firebaseUser;
    
    const barber = await BarberSetup.findOne({ firebaseUid: uid }).select('-pin');
    
    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Barber profile retrieved successfully',
      data: { barber }
    });

  } catch (error) {
    console.error('Error fetching barber profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching profile'
    });
  }
};


