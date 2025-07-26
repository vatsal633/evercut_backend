import express from "express";
import { checkUserAfterOTP, completeProfile, uploadUserPhoto } from "../../../controllers/user/auth/userAuth.controller.js";
import verifyToken from "../../../middleware/verifyToken.js";

const router = express.Router();

router.post("/checkUserAfterOTP", verifyToken, checkUserAfterOTP);
router.post("/complete-profile", verifyToken ,uploadUserPhoto.single("photo"), completeProfile);

export default router;
