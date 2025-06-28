import express from "express";
import { checkBarberAfterOTP, completeBarberProfile } from "../../../controllers/barber/auth/barberAuth.controller.js";
import verifyToken from "../../../middleware/verifyToken.js";

const router = express.Router();

router.post("/checkBarberAfterOTP", verifyToken, checkBarberAfterOTP);
router.post("/complete-barber-profile", completeBarberProfile);

export default router;
