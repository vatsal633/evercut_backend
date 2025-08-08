import Booking from '../../../models/Booking.model.js';
import Employee from '../../../models/EmployeeModel.js';
import BarberSetup from '../../../models/Barber.model.js';
import User from '../../../models/User.model.js';

/**
 * @description Get all booking data, number of employees, and number of customers for a specific shop.
 * @route GET /api/business/bookings/:shopId
 */
export const getBookingDataByShop = async (req, res) => {
    try {
        const { shopId } = req.params;

        // 1. Find the barber's shop to get their unique firebaseUid
        const barber = await BarberSetup.findById(shopId);
        if (!barber) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found.',
            });
        }

        // 2. Find all employees belonging to this barber using the firebaseUid
        const shopEmployees = await Employee.find({ firebaseUid: barber.firebaseUid }).select('_id');
        const employeeIds = shopEmployees.map(emp => emp._id);

        // 3. Find all bookings that are assigned to any of the shop's employees
        const bookings = await Booking.find({ salonist: { $in: employeeIds } })
            .populate({
                path: 'userId',
                select: 'name phoneNumber',
            })
            .populate({
                path: 'salonist',
                select: 'firstName lastName',
            })
            .populate('serviceId', 'serviceName offerPrice');




        // 5. Get the number of unique customers from the bookings found
        const numCustomers = await Booking.distinct('userId', { salonist: { $in: employeeIds } });

        res.status(200).json({
            success: true,
            message: 'Booking data retrieved successfully.',
            data: {
                bookings,
                numberOfEmployees: employeeIds.length,
                numberOfCustomers: numCustomers.length,
            }
        });

    } catch (error) {
        console.error('Error fetching booking data:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching booking data.'
        });
    }
};


/**
 * @description Delete a booking and free up the employee's time slot after payment.
 * @route DELETE /api/business/bookings/:bookingId
 */
export const deleteBookedSlotAfterPayment = async (req, res) => {
    try {
        const { bookingId } = req.params;

        // It's better to find the booking first to get its details for updating the employee schedule
        const bookingToDelete = await Booking.findById(bookingId);

        if (!bookingToDelete) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found.'
            });
        }

        // Optional but recommended: Check if payment status is 'success' before allowing deletion
        if (bookingToDelete.paymentStatus !== 'success') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete booking that has not been successfully paid for.'
            });
        }

        // 1. Remove the corresponding booking slot from the employee's schedule
        await Employee.findByIdAndUpdate(
            bookingToDelete.salonist,
            {
                $pull: {
                    bookingSlots: {
                        date: bookingToDelete.date.toISOString().split('T')[0],
                        start: bookingToDelete.timeSlot.start,
                        end: bookingToDelete.timeSlot.end
                    }
                }
            }
        );

        // 2. Now, permanently delete the booking document
        await Booking.findByIdAndDelete(bookingId);

        res.status(200).json({
            success: true,
            message: 'Booking has been successfully deleted and the time slot is now available.'
        });

    } catch (error) {
        console.error('Error deleting booked slot:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while deleting the booked slot.'
        });
    }
};
