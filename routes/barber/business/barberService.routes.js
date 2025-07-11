// routes/barber/business/barberService.routes.js
import express from 'express';
import {
    addService,
    getAllServices,
    updateService,
    deleteService
} from '../../../controllers/barber/business/barberService.controller.js';
import verifyToken from '../../../middleware/verifyToken.js';

const router = express.Router();

// Protected routes
router.post('/add', verifyToken, addService);
router.get('/', verifyToken, getAllServices);
router.put('/:id', verifyToken, updateService);      // PUT /api/services/:id
router.delete('/:id', verifyToken, deleteService);   // DELETE /api/services/:id

export default router;
