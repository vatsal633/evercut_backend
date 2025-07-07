// routes/userAuthRoutes.js - Updated with profile management routes
import express from 'express';
import { 
  checkUserAfterOTP, 
  completeProfile,
  getUserProfile,
  updateUserProfile,
  updateSpecificField
} from '../controllers/userAuth.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// Authentication routes
router.post('/checkUserAfterOTP', verifyToken, checkUserAfterOTP);
router.post('/complete-profile', completeProfile);

// 🆕 Profile management routes (all require authentication)
router.get('/profile', verifyToken, getUserProfile);              // GET /api/userauth/profile
router.put('/profile', verifyToken, updateUserProfile);           // PUT /api/userauth/profile
router.patch('/profile/field', verifyToken, updateSpecificField); // PATCH /api/userauth/profile/field

export default router;