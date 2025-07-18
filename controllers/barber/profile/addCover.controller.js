import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from '../../../config/cloudinary.js';
import Barber from '../../../models/Barber.model.js';

// Cloudinary storage for shop cover images
const coverPhotoStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: `evercut/barber/cover/${req.firebaseUser.firebaseUid}`,
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 600, crop: 'limit' }]
  })
});

export const uploadCoverPhoto = multer({ storage: coverPhotoStorage });

export const addOrUpdateShopCover = async (req, res) => {
  const { firebaseUid } = req.firebaseUser;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'No cover image uploaded' });
  }

  try {
    const coverUrl = file.path;
    const cloudinaryId = file.public_id;

    // Delete all previous images in the user's folder (except the new one)
    const folderPath = `evercut/barber/cover/${firebaseUid}`;

    const { resources } = await cloudinary.api.resources({
      type: 'upload',
      prefix: folderPath,
      max_results: 100
    });

    const oldImagePublicIds = resources
      .map(img => img.public_id)
      .filter(id => id !== cloudinaryId); // exclude the new one

    if (oldImagePublicIds.length > 1) {
      const deleteResult = await cloudinary.api.delete_resources(oldImagePublicIds);
      console.log('Deleted old cover images:', deleteResult);
    }

    // Update barber document with new cover image
    const updatedBarber = await Barber.findOneAndUpdate(
      { firebaseUid },
      { coverUrl, coverCloudinaryId: cloudinaryId },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: 'Shop cover image added/updated successfully',
      coverUrl: updatedBarber.coverUrl,
      cloudinaryId: updatedBarber.coverCloudinaryId
    });
  } catch (error) {
    console.error('Add/Update shop cover error:', error);
    res.status(500).json({
      message: 'Error adding/updating shop cover',
      error: error.message
    });
  }
};
