import express from 'express';
import {
  uploadPhotos,
  getPhotos,
  getPhotoById,
  updatePhoto,
  deletePhoto,
  permanentDeletePhoto,
  getPhotoStats,
  upload
} from '../controllers/photoController.js'; // ✅ Fixed: lowercase 'p' to match your actual filename
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// POST /api/photos/upload - Upload single or multiple photos
router.post('/upload', upload.array('photos', 10), uploadPhotos);

// GET /api/photos - Get all photos for authenticated barber
// Query parameters: photoType, page, limit, sortBy, sortOrder
router.get('/', getPhotos);

// GET /api/photos/stats - Get photo statistics
router.get('/stats', getPhotoStats);

// GET /api/photos/:id - Get single photo by ID
router.get('/:id', getPhotoById);

// PUT /api/photos/:id - Update photo details
router.put('/:id', updatePhoto);

// DELETE /api/photos/:id - Soft delete photo
router.delete('/:id', deletePhoto);

// DELETE /api/photos/:id/permanent - Permanently delete photo
router.delete('/:id/permanent', permanentDeletePhoto);

export default router;