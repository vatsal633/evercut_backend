import express from 'express';
import { addService } from '../controllers/serviceController.js';
import verifyToken from '../middleware/verifyToken.js';

const router2 = express.Router();

// Protected route
router2.post('/', verifyToken, addService);

export default router2;
