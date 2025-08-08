// routes/business/booking.routes.js
import express from 'express';
import * as bookingController from '../../../controllers/barber/booking/booking.controller.js'
import verifyToken from "../../../middleware/verifyToken.js"

const router = express.Router();

router.get('/:shopId', verifyToken, bookingController.getBookingDataByShop);
router.delete('/:bookingId', verifyToken, bookingController.deleteBookedSlotAfterPayment);

export default router;