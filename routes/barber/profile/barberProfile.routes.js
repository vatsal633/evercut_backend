import express from "express";
import { getBarberProfile, updateBarberPin } from "../../../controllers/barber/profile/barberProfile.controller.js";
import verifyToken from "../../../middleware/verifyToken.js";

const router = express.Router();

router.get("/profile", verifyToken, getBarberProfile);
router.put("/update-pin", verifyToken, updateBarberPin);

export default router;
