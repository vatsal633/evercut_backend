// routes/barber/business/barberEmployee.routes.js
import express from 'express';
import { addEmployee, getAllEmployees } from '../../../controllers/barber/business/barberEmployee.controller.js';
import verifyToken from '../../../middleware/verifyToken.js';

const router = express.Router();

router.post('/add', verifyToken, addEmployee);
router.get('/', verifyToken, getAllEmployees);

export default router;
