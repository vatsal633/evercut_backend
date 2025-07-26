import express from "express";
import * as shopinfoContoller from "../../../controllers/user/shopInfo/shopinfo.controller.js" ;
import verifyToken from "../../../middleware/verifyToken.js";

const router = express.Router();

router.get("/get-barber-shop", verifyToken, shopinfoContoller.getBorberShop);

export default router;