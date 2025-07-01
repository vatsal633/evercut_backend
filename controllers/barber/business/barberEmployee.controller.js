// controllers/barber/business/barberEmployee.controller.js
import Employee from '../../../models/EmployeeModel.js';

export const addEmployee = async (req, res) => {
    const firebaseUid = req.firebaseUser?.uid || req.body.firebaseUid;
    const { firstName, lastName, birthDate, gender, phoneNumber } = req.body;

    try {
        // Check if employee with same phone exists for this barber
        const existing = await Employee.findOne({ phoneNumber });
        if (existing) {
            return res.status(400).json({ message: 'Employee with this phone number already exists' });
        }

        const employee = await Employee.create({
            firebaseUid,
            firstName,
            lastName,
            birthDate,
            gender,
            phoneNumber,
        });

        res.status(201).json({ message: 'Employee added successfully', employee });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add employee' });
    }
};

export const getAllEmployees = async (req, res) => {
    const firebaseUid = req.firebaseUser?.uid || req.body.firebaseUid;

    try {
        const employees = await Employee.find({ firebaseUid });
        res.status(200).json({ employees });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to get employees' });
    }
};
