import express from "express"
import verifyToken from "../../../middleware/verifyToken.js"
import * as userBookingContoller from "../../../controllers/user/booking/userBooking.controller.js"

const router = express.Router()

router.post('/book',verifyToken,userBookingContoller.BookSalon)
router.get('/booking-details/:bookingId',verifyToken,userBookingContoller.getBookingDetails)
router.get('/check-availibility/:employeeId',verifyToken,userBookingContoller.getEmployeeCalendarData)
router.get('/filer-bookings',verifyToken,userBookingContoller.filterBookings)
router.post('/add-favorite/:bookingId',verifyToken,userBookingContoller.addToFavorites)

export default router