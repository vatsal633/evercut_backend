import BarberSetup from '../models/BarberModel.js';

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
  // ✅ Get firebaseUid from the authenticated user
  const { uid } = req.firebaseUser;

  // ✅ Debug logging
  console.log('=== DEBUG INFO ===');
  console.log('Firebase UID:', uid);
  console.log('Request body:', req.body);
  console.log('==================');

  const {
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
    // ✅ Check if barber already exists using Firebase UID
    const existing = await BarberSetup.findOne({ firebaseUid: uid });
    if (existing) {
      return res.status(400).json({ error: 'Barber profile already exists' });
    }

    // ✅ Validate required fields
    const requiredFields = {
      firebaseUid: uid, // Use UID from Firebase auth
      phoneNumber,
      shopName,
      numberOfEmployees,
      yearsOfExperience,
      shopOwner,
      emailId,
      upiId,
      location,
      shopCategory,
      pin
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => value === undefined || value === null || value === '')
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields: missingFields
      });
    }

    // ✅ Check if PINs match
    if (pin !== confirmPin) {
      return res.status(400).json({ error: 'PINs do not match' });
    }

    // ✅ Create barber profile
    const barber = await BarberSetup.create({
      firebaseUid: uid, // Use UID from Firebase auth
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
      pin, // You should hash this in production
    });

    // ✅ Don't return the PIN in response
    const { pin: _, confirmPin: __, ...safeBarber } = barber.toObject();

    res.status(201).json({
      message: 'Barber profile created successfully',
      barber: safeBarber
    });
  } catch (err) {
    console.error('Error creating barber profile:', err);
    res.status(500).json({ error: 'Could not complete barber profile' });
  }
};