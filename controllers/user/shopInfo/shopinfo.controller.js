import BarberSetup from '../../../models/Barber.model.js';
import Services from "../../../models/Service.js";
import Photo from "../../../models/PhotoModel.js";

export const getBorberShop = async (req, res) => {
  const { firebaseUid } = req.firebaseUser;

  try {
    //  Fetch barber details (only required fields)
    const existingBarber = await BarberSetup.find({ firebaseUid })
      .select('coverUrl shopName location facilities phoneNumber shopOwner address')
      .lean();

    if (!existingBarber) {
      return res.status(404).json({
        success: false,
        message: 'Barber profile not found.'
      });
    }

    //  Fetch services related to barber
    const services = await Services.find({ firebaseUid })
      .select('serviceName finalPrice duration')
      .lean();

    //  Fetch active photos
    const photos = await Photo.find({ firebaseUid, isActive: true })
      .select('photoName photoUrl')
      .sort({ uploadedAt: -1 })
      .lean();

    //  Success response
    res.status(200).json({
      success: true,
      message: 'Barber profile fetched successfully',
      barber: existingBarber,
      services,
      photos
    });

  } catch (error) {
    console.error(`Error fetching barber profile for UID: ${firebaseUid}`, error);

    //  Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    //  Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate key error. Email or phone number already exists.'
      });
    }

    //  Default error response
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching profile'
    });
  }
};
