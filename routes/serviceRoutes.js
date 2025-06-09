import express from 'express';
import { 
  addService, 
  getServices, 
  updateService, 
  deleteService 
} from '../controllers/serviceController.js';
import verifyToken from '../middleware/verifyToken.js';

const router2 = express.Router();

// All routes are protected and require authentication
router2.post('/', verifyToken, addService);           // POST /api/services
router2.get('/', verifyToken, getServices);           // GET /api/services
router2.put('/:id', verifyToken, updateService);      // PUT /api/services/:id
router2.delete('/:id', verifyToken, deleteService);   // DELETE /api/services/:id

export default router2;