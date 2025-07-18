import Photo from '../../../models/PhotoModel.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../../config/cloudinary.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => ({
    folder: `evercut/barber/${req.firebaseUser.firebaseUid}`, // Dynamic folder per barber
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  })
});

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files at once
  },
  fileFilter: fileFilter
});

// Upload single or multiple photos
export const uploadPhotos = async (req, res) => {
  const { firebaseUid } = req.firebaseUser;

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: 'No files uploaded'
      });
    }

    const { photoType = 'other', description = '' } = req.body;

    // Check photo limit (optional - you can set a limit per barber)
    const existingPhotoCount = await Photo.getPhotoCountByBarber(firebaseUid);
    const maxPhotos = 10; // Set your limit

    if (existingPhotoCount + req.files.length > maxPhotos) {

      return res.status(400).json({
        message: `Photo limit exceeded. Maximum ${maxPhotos} photos allowed.`
      });
    }

    const uploadedPhotos = [];

    for (const file of req.files) {
      const photoUrl = file.path;
      const cloudinaryId = file.public_id  || file.filename;

      const photo = await Photo.create({
        firebaseUid,
        photoUrl,
        photoName: file.originalname,
        photoType,
        description,
        fileSize: file.size,
        mimeType: file.mimetype,
        cloudinaryId
      });

      uploadedPhotos.push(photo);
    }

    res.status(201).json({
      message: `${uploadedPhotos.length} photo(s) uploaded successfully`,
      photos: uploadedPhotos
    });

  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({
      message: 'Error uploading photos',
      error: error.message
    });
  }
};

// Get all photos for authenticated barber
export const getPhotos = async (req, res) => {
  const { firebaseUid } = req.firebaseUser;

  try {
    const {
      photoType,
      page = 1,
      limit = 20,
      sortBy = 'uploadedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {
      firebaseUid,
      isActive: true
    };

    if (photoType && photoType !== 'all') {
      query.photoType = photoType;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get photos with pagination
    const photos = await Photo.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalPhotos = await Photo.countDocuments(query);
    const totalPages = Math.ceil(totalPhotos / parseInt(limit));

    res.status(200).json({
      message: 'Photos retrieved successfully',
      photos,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalPhotos,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({
      message: 'Error fetching photos',
      error: error.message
    });
  }
};

// Get single photo by ID
export const getPhotoById = async (req, res) => {
  const { firebaseUid } = req.firebaseUser;
  const { id } = req.params;

  try {
    const photo = await Photo.findOne({
      _id: id,
      firebaseUid,
      isActive: true
    });

    if (!photo) {
      return res.status(404).json({
        message: 'Photo not found'
      });
    }

    res.status(200).json({
      message: 'Photo retrieved successfully',
      photo
    });

  } catch (error) {
    console.error('Get photo by ID error:', error);
    res.status(500).json({
      message: 'Error fetching photo',
      error: error.message
    });
  }
};


// Soft delete photo (set isActive to false)
export const deletePhoto = async (req, res) => {
  const { firebaseUid } = req.firebaseUser;
  const { id } = req.params;

  try {
    // Permanently delete from MongoDB
    const photo = await Photo.findOneAndDelete({
      _id: id,
      firebaseUid,
      isActive: true
    });

    console.log('Photo document:', photo);

    if (!photo) {
      return res.status(404).json({
        message: 'Photo not found'
      });
    }
    if (photo.cloudinaryId) {
      console.log('Deleting from Cloudinary:', photo.cloudinaryId);
      // await cloudinary.uploader.destroy(photo.cloudinaryId);
      const result = await cloudinary.uploader.destroy(photo.cloudinaryId);
  console.log('Cloudinary destroy result:', result);
    }
    res.status(200).json({
      message: 'Photo deleted successfully'
    });

  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({
      message: 'Error deleting photo',
      error: error.message
    });
  }
};


// Get photo statistics for barber
export const getPhotoStats = async (req, res) => {
  const { firebaseUid } = req.firebaseUser;

  try {
    const stats = await Photo.aggregate([
      { $match: { firebaseUid, isActive: true } },
      {
        $group: {
          _id: '$photoType',
          count: { $sum: 1 },
          totalSize: { $sum: '$fileSize' }
        }
      }
    ]);

    const totalPhotos = await Photo.countDocuments({ firebaseUid, isActive: true });
    const totalSize = await Photo.aggregate([
      { $match: { firebaseUid, isActive: true } },
      { $group: { _id: null, totalSize: { $sum: '$fileSize' } } }
    ]);

    res.status(200).json({
      message: 'Photo statistics retrieved successfully',
      stats: {
        totalPhotos,
        totalSize: totalSize[0]?.totalSize || 0,
        byType: stats
      }
    });

  } catch (error) {
    console.error('Get photo stats error:', error);
    res.status(500).json({
      message: 'Error fetching photo statistics',
      error: error.message
    });
  }
};