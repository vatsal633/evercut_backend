import Photo from '../models/PhotoModel.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/photos');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = `${req.firebaseUser?.uid || 'unknown'}-${uniqueSuffix}${fileExtension}`;
    cb(null, fileName);
  }
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
  const firebaseUid = req.firebaseUser?.uid;
  
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        message: 'No files uploaded' 
      });
    }

    const { photoType = 'other', description = '' } = req.body;
    
    // Check photo limit (optional - you can set a limit per barber)
    const existingPhotoCount = await Photo.getPhotoCountByBarber(firebaseUid);
    const maxPhotos = 50; // Set your limit
    
    if (existingPhotoCount + req.files.length > maxPhotos) {
      // Delete uploaded files if limit exceeded
      req.files.forEach(file => {
        fs.unlinkSync(file.path);
      });
      
      return res.status(400).json({ 
        message: `Photo limit exceeded. Maximum ${maxPhotos} photos allowed.` 
      });
    }

    const uploadedPhotos = [];

    for (const file of req.files) {
      const photoUrl = `/uploads/photos/${file.filename}`;
      
      const photo = await Photo.create({
        firebaseUid,
        photoUrl,
        photoName: file.originalname,
        photoType,
        description,
        fileSize: file.size,
        mimeType: file.mimetype
      });

      uploadedPhotos.push(photo);
    }

    res.status(201).json({
      message: `${uploadedPhotos.length} photo(s) uploaded successfully`,
      photos: uploadedPhotos
    });

  } catch (error) {
    console.error('Photo upload error:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({ 
      message: 'Error uploading photos',
      error: error.message 
    });
  }
};

// Get all photos for authenticated barber
export const getPhotos = async (req, res) => {
  const firebaseUid = req.firebaseUser?.uid;
  
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
  const firebaseUid = req.firebaseUser?.uid;
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

// Update photo details (not the file itself)
export const updatePhoto = async (req, res) => {
  const firebaseUid = req.firebaseUser?.uid;
  const { id } = req.params;
  const { photoType, description } = req.body;

  try {
    const updateData = {};
    
    if (photoType) updateData.photoType = photoType;
    if (description !== undefined) updateData.description = description;

    const photo = await Photo.findOneAndUpdate(
      { _id: id, firebaseUid, isActive: true },
      updateData,
      { new: true, runValidators: true }
    );

    if (!photo) {
      return res.status(404).json({ 
        message: 'Photo not found' 
      });
    }

    res.status(200).json({
      message: 'Photo updated successfully',
      photo
    });

  } catch (error) {
    console.error('Update photo error:', error);
    res.status(500).json({ 
      message: 'Error updating photo',
      error: error.message 
    });
  }
};

// Soft delete photo (set isActive to false)
export const deletePhoto = async (req, res) => {
  const firebaseUid = req.firebaseUser?.uid;
  const { id } = req.params;

  try {
    const photo = await Photo.findOneAndUpdate(
      { _id: id, firebaseUid, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!photo) {
      return res.status(404).json({ 
        message: 'Photo not found' 
      });
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

// Hard delete photo (permanently remove from database and filesystem)
export const permanentDeletePhoto = async (req, res) => {
  const firebaseUid = req.firebaseUser?.uid;
  const { id } = req.params;

  try {
    const photo = await Photo.findOneAndDelete({ 
      _id: id, 
      firebaseUid 
    });

    if (!photo) {
      return res.status(404).json({ 
        message: 'Photo not found' 
      });
    }

    // Delete physical file
    const filePath = path.join(__dirname, `..${photo.photoUrl}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({
      message: 'Photo permanently deleted'
    });

  } catch (error) {
    console.error('Permanent delete photo error:', error);
    res.status(500).json({ 
      message: 'Error permanently deleting photo',
      error: error.message 
    });
  }
};

// Get photo statistics for barber
export const getPhotoStats = async (req, res) => {
  const firebaseUid = req.firebaseUser?.uid;

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