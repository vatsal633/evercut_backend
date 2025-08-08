import EmployeeModel from "../../../models/EmployeeModel.js"
import Booking from "../../../models/Booking.model.js"
import Service from "../../../models/Service.js"
import UserModel from "../../../models/User.model.js"
import BarberModel from "../../../models/Barber.model.js"

export const BookSalon = async (req, res) => {
  const { userId, serviceId, employeeId, shopId,date, time, amount } = req.body

  try {

    const shop = await BarberModel.findById(shopId).select("shopName address").lean()

    const employee = await EmployeeModel.findById(employeeId)
      .select("firstName lastName photoUrl")
      .lean()
    const service = await Service.findById(serviceId)
      .select("serviceName finalPrice")
      .lean()

    if (!employee) {
      return res.status(409).json({
        message: "salonist not found!",
      })
    }

    // check that employee is availavle at specific date
    if (employee.blockedDates && employee.blockedDates.length > 0) {
      const availableAtDate = employee.blockedDates.some((blockedDates) => {
        blockedDates === date
      })

      if (availableAtDate) {
        return res.status(401).json({
          success: false,
          message: "salonist is not available right now, please book another!"
        })
      }
    }



    //checking that sloat is already booked or not
    const sloatAlreadyBooked = employee.bookingSlots?.some((slot) => {
      return slot.date === date && slot.time === time
    })

    if (sloatAlreadyBooked) {
      return res.status(404).json({
        success: false,
        message: "Salonist not available at this date/time!"
      })
    }

    const bookingDetails = { ...employee, ...service }

    const newBooking = new Booking({
      userId: userId,
      serviceId: serviceId,
      salonist: employeeId,
      shopdata:shop,
      date,
      time,
      amount,
      status:"confirmed"
    })

    //save booking slot to employee
    await EmployeeModel.findByIdAndUpdate(
      employeeId,
      {
        $push: {
          bookingSlots: { date, time },// push the date and time to employee bookin slots array
          assignedCustomers: userId,//push the userid to employee assinged customers array
          services: serviceId//push the serviceid to employee services array
        },
      },
      { new: true }
    )

    await newBooking.save()

    res.status(200).json({
      status: "success",
      message: "Salonist Selected Successfully",
      bookingId: newBooking._id,
      bookingDetails, //for testing
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server Error While Selecting Salonist" })
  }
}

export const getBookingDetails = async (req, res) => {
  const { bookingId } = req.params

  try {
    const bookingDetails = await Booking.findById(bookingId)
      .populate("serviceId", "finalPrice serviceType")
      .populate("salonist", "firstName lastName photoUrl")
      .populate("userId", "firstName")
      .populate("shopId","shopName adress")

    if (!bookingDetails) {
      return res.status(404).json({ message: "Booking details not found!" })
    }

    res.status(200).json({
      status: "success",
      data: bookingDetails,
    })
  } catch (err) {
    console.error(err)
    res
      .status(500)
      .json({ message: "Server error while fetching booking details" })
  }
}

export const getEmployeeCalendarData = async (req, res) => {
  try {
    const { employeeId } = req.params
    const { date } = req.query 
    
    
    const employee = await EmployeeModel.findById(employeeId)
      .select("firstName lastName blockedDates workingHours")
      .lean()

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" })
    }

    if (!date) {
      return res.status(400).json({ success: false, message: "Date query parameter is required" })
    }

    //getting todays date
    const now = new Date()
    const todayStr = now.toISOString().slice(0,10)  // "2025-08-03"

    let bookings = []

    // fetch all the upcomming bookings and store in booking array
    if (date > todayStr) {
      bookings = await Booking.find({
        salonist: employeeId,
        date: date
      }).lean()

    } else if (date === todayStr) {
      // date is today than get bookings after current time
      const todayBookings = await Booking.find({
        salonist: employeeId,
        date: todayStr
      }).lean()

      //taking the current time
      const currentMinutes = now.getHours() * 60 + now.getMinutes()

      //
      bookings = todayBookings.filter(b => {
        if (!b.time) return false

        // parse time: "hh:mm AM/PM"
        const [timePart, ampm] = b.time.split(' ')
        const [hoursStr, minutesStr] = timePart.split(':')
        let hours = parseInt(hoursStr, 10)
        const minutes = parseInt(minutesStr, 10)

        if (ampm === 'PM' && hours !== 12) hours += 12
        if (ampm === 'AM' && hours === 12) hours = 0

        const bookingMinutes = hours * 60 + minutes

        return bookingMinutes > currentMinutes
      })

    } else {
      // past date → usually you’d return empty or an error
      return res.status(400).json({ success: false, message: "Cannot fetch past bookings" })
    }

    const bookedSlots = bookings.map(b => ({
      date: b.date,
      time: b.time,
      bookingInfo:b._id
    }))

    return res.status(200).json({
      success: true,
      employeeId,
      name: `${employee.firstName} ${employee.lastName}`,
      workingHours: employee.workingHours,
      blockedDates: employee.blockedDates,
      bookedSlots
    })

  } catch (error) {
    console.error("Error fetching calendar data:", error)
    res.status(500).json({
      message: "Error fetching calendar data",
      error: error.message
    })
  }
}
