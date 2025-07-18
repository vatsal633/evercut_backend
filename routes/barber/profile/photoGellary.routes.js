import express from "express";
import { upload, uploadPhotos, getPhotos, deletePhoto  } from "../../../controllers/barber/profile/userPhoto.controller.js";
import verifyToken from "../../../middleware/verifyToken.js";

const router = express.Router();

router.post("/photoUpload", verifyToken, upload.array('photos'), uploadPhotos);  // POST /api/photos/photoUpload    
router.get("/", verifyToken, getPhotos);  // GET /api/photos/
router.delete("/:id", verifyToken, deletePhoto); // DELETE /api/photos/:id

export default router;
