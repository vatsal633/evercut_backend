import BarberSetup from '../../../models/Barber.model.js';
import {
  validatePinUpdateRequest,
  verifyPin,
  hashPin
} from './barberPinValidation.service.js';

// Get barber profile
export const getBarberProfile = async (req, res) => {
  try {
    const { firebaseUid } = req.firebaseUser;

    const barber = await BarberSetup.findOne({ firebaseUid }).select('-pin');

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

// Update barber PIN
export const updateBarberPin = async (req, res) => {
  try {
    const { firebaseUid } = req.firebaseUser;
    const { currentPin, newPin, confirmNewPin } = req.body;

    // Validate PIN update request
    const validation = validatePinUpdateRequest({ currentPin, newPin, confirmNewPin });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // Find barber profile
    const barber = await BarberSetup.findOne({ firebaseUid });
    if (!barber) {
      return res.status(404).json({
        success: false,
        message: 'Barber profile not found'
      });
    }

    // Verify current PIN
    const isCurrentPinValid = await verifyPin(barber.pin, currentPin);
    if (!isCurrentPinValid) {
      return res.status(400).json({
        success: false,
        message: 'Current PIN is incorrect'
      });
    }

    // Hash the new PIN for security
    const hashedNewPin = await hashPin(newPin);

    // Update PIN in database
    const updatedBarber = await BarberSetup.findOneAndUpdate(
      { firebaseUid },
      {
        pin: hashedNewPin,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedBarber) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update PIN'
      });
    }

    res.status(200).json({
      success: true,
      message: 'PIN updated successfully'
    });

  } catch (error) {
    console.error('Error updating barber PIN:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating PIN'
    });
  }
};
