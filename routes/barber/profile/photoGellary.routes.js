import express from "express";
import { uploadPhotos, getPhotos, deletePhoto  } from "../../../controllers/barber/profile/userPhoto.controller.js";
import verifyToken from "../../../middleware/verifyToken.js";

const router = express.Router();

router.get("/photoUpload", verifyToken, uploadPhotos);
router.put("/", verifyToken, getPhotos);
router.delete("/:id", verifyToken, deletePhoto); // DELETE /api/photos/:id

export default router;
