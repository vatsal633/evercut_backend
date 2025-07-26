import express from "express";
import * as searchPageController from "../../../controllers/user/searchPage/searchPage.Controller.js"
import verifyToken from "../../../middleware/verifyToken.js"

const router = express.Router();

router.get("/search-services",verifyToken, searchPageController.searchServices);

export default router;
