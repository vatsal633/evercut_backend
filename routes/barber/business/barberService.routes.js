// routes/barber/business/barberService.routes.js
import express from 'express';
import { addService, getAllServices } from '../../../controllers/barber/business/barberService.controller.js';
import verifyToken from '../../../middleware/verifyToken.js';

const router = express.Router();

// Protected routes
router.post('/add', verifyToken, addService);
router.get('/', verifyToken, getAllServices);

export default router;
