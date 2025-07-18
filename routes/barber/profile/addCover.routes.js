import express from "express";
import { addOrUpdateShopCover, uploadCoverPhoto } from '../../../controllers/barber/profile/addCover.controller.js';
import verifyToken from "../../../middleware/verifyToken.js";


const router = express.Router();
router.post("/addCover", verifyToken, uploadCoverPhoto.single('photo'), addOrUpdateShopCover); // POST /api/barber/profile/addCover

export default router;