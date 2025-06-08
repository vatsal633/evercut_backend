import express from 'express';
import { checkUserAfterOTP, completeProfile } from '../controllers/userAuth.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// Check if user exists after OTP verification
// router.post('/check-user', verifyToken, checkUserAfterOTP);
router.post('/checkUserAfterOTP', verifyToken, checkUserAfterOTP);

// Complete profile (sign up)
router.post('/complete-profile', completeProfile);

export default router;
