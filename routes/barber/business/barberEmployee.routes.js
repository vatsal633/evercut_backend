// routes/barber/business/barberEmployee.routes.js
import express from 'express';
import {
     addEmployee, 
     getAllEmployees,
     updateEmployee, 
     deleteEmployee 
     } from '../../../controllers/barber/business/barberEmployee.controller.js';
import verifyToken from '../../../middleware/verifyToken.js';

const router = express.Router();

router.post('/add', verifyToken, addEmployee);
router.get('/', verifyToken, getAllEmployees);
router.put('/:id', verifyToken, updateEmployee);      // PUT /api/employees/:id
router.delete('/:id', verifyToken, deleteEmployee);   // DELETE /api/employees/:id

export default router;
