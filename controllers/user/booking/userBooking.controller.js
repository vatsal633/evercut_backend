import EmployeeModel from "../../../models/EmployeeModel.js";
import Booking from "../../../models/Booking.model.js";
import Service from "../../../models/Service.js";
import UserModel from "../../../models/User.model.js";

export const BookSalon = async (req, res) => {
  const { userId, serviceId, employeeId, date, time, amount } = req.body;

  try {
    const employee = await EmployeeModel.findById(employeeId)
      .select("firstName lastName photoUrl")
      .lean();
    const service = await Service.findById(serviceId)
      .select("serviceName finalPrice")
      .lean();

    if (!employee) {
      return res.status(409).json({
        message: "salonist not found!",
      });
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

    const bookingDetails = { ...employee, ...service };

    const newBooking = new Booking({
      userId: userId,
      serviceId: serviceId,
      salonist: employeeId,
      date,
      time,
      amount,
    });

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

    await newBooking.save();

    res.status(200).json({
      status: "success",
      message: "Salonist Selected Successfully",
      bookingId: newBooking._id,
      bookingDetails, //for testing
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error While Selecting Salonist" });
  }
};

export const getBookingDetails = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const bookingDetails = await Booking.findById(bookingId)
      .populate("serviceId", "finalPrice")
      .populate("salonist", "firstName lastName photoUrl")
      .populate("userId", "firstName");

    if (!bookingDetails) {
      return res.status(404).json({ message: "Booking details not found!" });
    }

    res.status(200).json({
      status: "success",
      data: bookingDetails,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Server error while fetching booking details" });
  }
};

export const getSalonistAvailibility = async (req, res) => {
  const { employeeId } = req.params

  try {
    let availability = await EmployeeModel.findById(employeeId).select("blockedDates bookingSlots")

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: "salonist not found in database"
      })
    }

    res.status(200).json({
      success: true,
      message: "salonist availibility fetch successfully",
      data: availability
    })

  } catch (error) {
    console.log("error occuured in getSalonistAvailibility", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching availabel slots"
    })
  }
}

export const getAllEmployeesAvailability = async (req, res) => {
  try {
    const {firebaseUid} = req.firebaseUser
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required in query" });
    }

    const employees = await EmployeeModel.find({firebaseUid}).lean();
    if (!employees.length) {
      return res.status(404).json({ message: "No employees found" });
    }

    const generateTimeSlots = (start, end, interval) => {
      const slots = [];
      let current = new Date(`1970-01-01T${start}:00`);
      const endTime = new Date(`1970-01-01T${end}:00`);
      while (current < endTime) {
        const next = new Date(current.getTime() + interval * 60000);
        slots.push({
          start: current.toTimeString().slice(0, 5),
          end: next.toTimeString().slice(0, 5),
          status: "available"
        });
        current = next;
      }
      return slots;
    };

    const allSlots = generateTimeSlots("09:00", "18:00", 30);

    const availabilityData = employees.map(emp => {
      const bookedSlots = (emp.bookingSlots || []).filter(slot => slot.date === date);

      const updatedSlots = allSlots.map(slot => {
        const isBooked = bookedSlots.some(
          booked => slot.start < booked.end && slot.end > booked.start
        );
        return { ...slot, status: isBooked ? "booked" : "available" };
      });

      return {
        employeeId: emp._id,
        name: `${emp.firstName} ${emp.lastName}`,
        slots: updatedSlots
      };
    });

    return res.status(200).json({
      status: "success",
      date,
      employees: availabilityData
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({
      message: "Error fetching availability",
      error: error.message
    });
  }
};