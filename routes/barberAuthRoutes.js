// import express from "express";
// import BarberSetup from "../models/BarberSetup.js";
// import bcrypt from "bcryptjs";

// const router = express.Router();

// // POST /api/barber/setup
// router.post("/setup", async (req, res) => {
//     console.log("✅ /api/barber/setup hit");
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

//     // Step 4: Validate PIN
//     if (pin !== confirmPin) {
//       return res.status(400).json({ message: "PINs do not match" });
//     }

//     // Hash the PIN
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
//     res.status(201).json({ message: "Barber setup completed successfully", barber: newBarber });

//   } catch (error) {
//     console.error("Barber setup error:", error);
//     res.status(500).json({ message: "Server error during setup" });
//   }
// });

// export default router;


// routes/barberSetupRoutes.js
// import express from "express";
// import BarberSetup from "../models/BarberSetup.js";
// import bcrypt from "bcryptjs";

// const router = express.Router();

// // POST /api/barber/setup
// router.post("/setup", async (req, res) => {
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

//     // Validate PINs
//     if (pin !== confirmPin) {
//       return res.status(400).json({ message: "PINs do not match" });
//     }

//     // Hash the PIN
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

//     // Remove hashed pin from response
//     const { pin: _, ...safeBarber } = newBarber.toObject();

//     res.status(201).json({
//       message: "Barber setup completed successfully",
//       barber: safeBarber,
//     });
//   } catch (error) {
//     console.error("❌ Barber setup error:", error);
//     res.status(500).json({ message: "Server error during setup" });
//   }
// });

// export default router;


import express from "express";
import {checkBarberAfterOTP, completeBarberProfile } from "../controllers/barberAuth.js";
import verifyToken from "../middleware/verifyToken.js";

const router1 = express.Router();

router1.post("/checkBarberAfterOTP", verifyToken, checkBarberAfterOTP);
router1.post("/complete-barber-profile", verifyToken, completeBarberProfile); // ✅ Added verifyToken

export default router1;
