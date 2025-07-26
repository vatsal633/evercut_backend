import express from "express"
import verifyToken from "../../../middleware/verifyToken.js"
import * as homepageController from "../../../controllers/user/homepage/homepage.controller.js"
const router = express.Router()


router.get('/doorstep-services',verifyToken,homepageController.getDoorstepServices)
router.get('/shops-nearby',verifyToken,homepageController.getShopNearBy)
router.get('/get-shop-service',verifyToken,homepageController.getNearByShopServicesByGender)
router.get('/get-service/:gender',verifyToken,homepageController.getServiceByGender)


export default router