import BarberSetup from '../../../models/Barber.model.js';
import { validateBusinessUpdate } from './barberValidation.service.js';

// Update business info
export const updateBusinessInfo = async (req, res) => {
  try {
    const { firebaseUid } = req.firebaseUser;

    // Validate if barber exists
    const existingBarber = await BarberSetup.findOne({ firebaseUid });
    if (!existingBarber) {
      return res.status(404).json({
        success: false,
        message: 'Barber profile not found. Please complete your profile first.'
      });
    }

    // Validate and filter update data
    const { updateData, errors } = validateBusinessUpdate(req.body);

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
      { firebaseUid },
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
