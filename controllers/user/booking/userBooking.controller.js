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
      return res.status(404).json({
        message: "salonist not found!",
      });
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
