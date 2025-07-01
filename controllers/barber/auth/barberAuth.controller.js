import BarberSetup from '../../../models/Barber.model.js';
import { validatePinCreation, hashPin } from '../profile/barberPinValidation.service.js';

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

    // Validate PIN creation
    const pinValidation = validatePinCreation(pin, confirmPin);
    if (!pinValidation.isValid) {
      return res.status(400).json({ message: pinValidation.message });
    }

    // Hash the PIN for security
    const hashedPin = await hashPin(pin);

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
      pin: hashedPin,
    });

    res.status(201).json({ message: 'Barber profile saved', barber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not complete barber profile' });
  }
};
