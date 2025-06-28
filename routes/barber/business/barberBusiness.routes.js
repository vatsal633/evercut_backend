import express from "express";
import { updateBusinessInfo } from "../../../controllers/barber/business/barberBusiness.controller.js";
import verifyToken from "../../../middleware/verifyToken.js";

const router = express.Router();

router.put("/update-business", verifyToken, updateBusinessInfo);

export default router;
