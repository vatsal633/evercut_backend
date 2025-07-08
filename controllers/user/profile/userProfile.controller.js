import User from '../../../models/User.model.js';

// Get user profile (for existing users)
export const getUserProfile = async (req, res) => {
  const { uid } = req.firebaseUser;

  try {
    const user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateUserProfile = async (req, res) => {
  const { uid } = req.firebaseUser;
  const updateData = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { firebaseUid: uid },
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
