import express from "express";
import { getUserProfile, updateUserProfile } from "../../../controllers/user/profile/userProfile.controller.js";
import verifyToken from "../../../middleware/verifyToken.js";

const router = express.Router();

router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, updateUserProfile);

export default router;
