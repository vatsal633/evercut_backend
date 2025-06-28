import express from "express";
import { getBarberProfile } from "../../../controllers/barber/profile/barberProfile.controller.js";
import verifyToken from "../../../middleware/verifyToken.js";

const router = express.Router();

router.get("/profile", verifyToken, getBarberProfile);

export default router;
