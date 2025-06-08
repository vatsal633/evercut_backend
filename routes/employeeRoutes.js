// routes/employeeRoutes.js
import express from 'express';
import { addEmployee } from '../controllers/employeeController.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/add', verifyToken, addEmployee);

export default router;
