// import BarberSetup from "../models/BarberSet.js";
// import bcrypt from "bcryptjs";

// export const handleBarberSetup = async (req, res) => {
//   console.log("✅ /api/barber/setup hit");

//   try {
//     const {
//       shopName,
//       numberOfEmployees,
//       yearsOfExperience,
//       upiId,
//       location,
//       bio,
//       shopCategory,
//       facilities,
//       availableDays,
//       openTime,
//       closeTime,
//       breakTimes,
//       pin,
//       confirmPin,
//     } = req.body;

//     if (pin !== confirmPin) {
//       return res.status(400).json({ message: "PINs do not match" });
//     }

//     const hashedPin = await bcrypt.hash(pin, 10);

//     const newBarber = new BarberSetup({
//       shopName,
//       numberOfEmployees,
//       yearsOfExperience,
//       upiId,
//       location,
//       bio,
//       shopCategory,
//       facilities,
//       availableDays,
//       openTime,
//       closeTime,
//       breakTimes,
//       pin: hashedPin,
//     });

//     await newBarber.save();

//     res.status(201).json({
//       message: "Barber setup completed successfully",
//       barber: newBarber,
//     });

//   } catch (error) {
//     console.error("Barber setup error:", error);
//     res.status(500).json({ message: "Server error during setup" });
//   }
// };


import BarberSetup from '../models/BarberModel.js';
// import bcrypt from 'bcryptjs';


export const checkBarberAfterOTP = async (req, res) => {
  const { uid, phone_number } = req.firebaseUser;

  try {
    const barber = await BarberSetup.findOne({ firebaseUid: uid });

    if (barber) {
      return res.status(200).json({
        message: 'Login successful',
        barber,
        isNewBarber: false,
      });
    } else {
      return res.status(200).json({
        message: 'New barber, complete profile',
        isNewBarber: true,
        firebaseUid: uid,
        phoneNumber: phone_number,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error checking barber' });
  }
};

export const completeBarberProfile = async (req, res) => {
  const {
    firebaseUid,
    phoneNumber,
    shopName,
    numberOfEmployees,
    yearsOfExperience,
    shopOwner,
    emailId,
    upiId,
    location,
    bio,
    shopCategory,
    facilities,
    availableDays,
    openTime,
    closeTime,
    breakTimes,
    pin,
    confirmPin,
  } = req.body;

  try {
    const existing = await BarberSetup.findOne({ firebaseUid });
    if (existing) {
      return res.status(400).json({ error: 'Barber already exists' });
    }

      // 2. Check if PINs match
      if (pin !== confirmPin) {
        return res.status(400).json({ message: 'PINs do not match' });
      }
  
      // 3. Hash the PIN
      // const hashedPin = await bcrypt.hash(pin, 10);

    const barber = await BarberSetup.create({
      firebaseUid,
      phoneNumber,
      shopName,
      numberOfEmployees,
      yearsOfExperience,
      shopOwner,
      emailId,
      upiId,
      location,
      bio,
      shopCategory,
      facilities,
      availableDays,
      openTime,
      closeTime,
      breakTimes,
      pin,
      confirmPin,
    });

    res.status(201).json({ message: 'Barber profile saved', barber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not complete barber profile' });
  }
};


