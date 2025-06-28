import BarberSetup from '../../../models/Barber.model.js';

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
