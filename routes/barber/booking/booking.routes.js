// routes/business/booking.routes.js
import express from 'express';
import * as bookingController from '../../../controllers/barber/booking/booking.controller.js'
import verifyToken from "../../../middleware/verifyToken.js"

const router = express.Router();

router.get('/get-bookingd/:shopId', verifyToken, bookingController.getBookingDataByShop);
router.delete('/:bookingId', verifyToken, bookingController.deleteBookedSlotAfterPayment);
router.get("/bookings/count", verifyToken, bookingController.getAllBookings);
router.get("/pending-bookings/count", verifyToken, bookingController.getPendingBookings);
router.get("/complete-bookings/count", verifyToken, bookingController.getCompletedBookings);
router.get("/complete-bookings", verifyToken, bookingController.getCompletedBookingsDetails);

export default router;