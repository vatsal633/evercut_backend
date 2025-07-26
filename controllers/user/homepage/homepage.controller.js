import BarberModel from "../../../models/Barber.model.js";
import Service from "../../../models/Service.js";
import UserModel from "../../../models/User.model.js";

/**
 * @desc fetch all the doorstep service provider shops
 * @route   GET /api/user/homepage/doorstep-services
 * @access  Private
 * @returns {Object} JSON response: doorstepShops
 */
export const getDoorstepServices = async (req, res) => {
  try {
    const doorstepShops = await BarberModel.find({
      shopCategory: "Door-Step",
    }).select("shopName location coverUrl address");

    if (!doorstepShops || doorstepShops.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Door-Step services found for this barber.",
      });
    }

    res.status(200).json({
      success: true,
      message: `${doorstepShops.length} Door step service shops were found`,
      shops: doorstepShops,
    });
  } catch (error) {
    console.error("Error in getDoorstepServices:", error.message, error.stack);
    res.status(500).json({
      success: false,
      message: "Internal Server Error wtf",
    });
  }
};

/**
 * @desc for fetch all the near by shops at specific range(eg.1km) according to user coordinates
 * @route  GET /api/user/homepage/shops-nearby
 * @access  Private
 * @param {Object} req.body.userLocation - User's current location.
 * @param {number} req.body.userLocation.latitude - Latitude of the user's location.
 * @param {number} req.body.userLocation.longitude - Longitude of the user's location.
 * @returns {Object} JSON response: nearby shops
 */

export const getShopNearBy = async (req, res) => {
  const { firebaseUid } = req.firebaseUser;

  try {
    const user = await UserModel.findOne({ firebaseUid });

    if (!user || !user.location || !user.location.coordinates) {
      return res.status(404).json({
        success: false,
        message: "User not found or location and coordinates are required",
      });
    }

    const userCoordinates = user.location.coordinates;

    const nearByShops = await BarberModel.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: userCoordinates,
          },
          $maxDistance: 2000,
        },
      },
    }).select("ShopName address coverUrl facilities shopName");

    if (!nearByShops || nearByShops.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No NearBy Shops Were Found",
      });
    }

    res.status(200).json({
      success: true,
      message: `${nearByShops.length} NearByShops were Found`,
      shops: nearByShops,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "server error while fetching shop nearby" });
  }
};

/**
 * @desc for fetch all the nearby shops and its services according to gender when click on see all on homepage
 * @route  GET /api/user/homepage/get-shop-service/:gender
 * @access  Private
 * @param {string} req.params - User's gender.
 * @returns {Object} JSON response: nearby shops
 */

export const getNearByShopServicesByGender = async (req, res) => {
  const { firebaseUid } = req.firebaseUser;
  const { SearhedServiceName, gender } = req.query;

  try {
    const user = await UserModel.findOne({ firebaseUid });

    if (!user || !user.location || !user.location.coordinates) {
      return res.status(404).json({
        success: false,
        message: "User not found or location and coordinates are required",
      });
    }

    const userCoordinates = user.location.coordinates;

    const nearByShops = await BarberModel.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: userCoordinates },
          $maxDistance: 2000,
        },
      },
    }).select("shopName address coverUrl firebaseUid");

    if (!nearByShops || nearByShops.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No nearby shops found!",
      });
    }

    const shopIds = nearByShops.map((shops) => shops._id);

    //fetch only searched services
    if (SearhedServiceName) {
      const searchedServices = await Service.find({
        shopId: { $in: shopIds },
        serviceName: { $regex: SearhedServiceName, $options: "i" },
        serviceFor: gender,
      }).select("serviceName firebaseUid shopId serviceFor serviceType");

          if (!searchedServices) {
            return res.status(404).json({
              success: false,
              message: `No active services found for ${gender}`,
            });
          }

      return res.status(200).json({
        success: true,
        message: `${nearByShops.length} nearby shops and ${searchedServices.length} services found!`,
        shops: nearByShops,
        services: searchedServices,
      });
    }

    //by default fetch all the service of nearby shops(with shops _id)
    const services = await Service.find({
      shopId: { $in: shopIds },
      serviceFor: gender,
    }).select("serviceName firebaseUid shopId serviceFor serviceType");

    if (!services || services.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No active services found for ${gender}`,
      });
    }

    res.status(200).json({
      success: true,
      message: `${nearByShops.length} nearby shops and ${services.length} services found!`,
      shops: nearByShops,
      services: services,
    });
  } catch (error) {
    console.error("Error in getNearByShopServicesByGender:", error);
    res.status(500).json({
      success: false,
      message: `Unable to fetch services for ${gender}`,
    });
  }
};

/**
 * @desc for fetch all the services according to gender
 * @route  GET /api/user/homepage/get-service/:gender
 * @access  Private
 * @param {string} req.params - User's gender.
 * @returns {Object} JSON response: services
 */
export const getServiceByGender = async (req, res) => {
  const { gender } = req.params;

  try {
    const services = await Service.find({ serviceFor: gender }).select(
      "serviceName firebaseUid shopId serviceFor serviceType"
    );

    if (!services || services.length === 0) {
      return res.status(404).json({
        success: false,
        message: `no active service found for ${gender}`,
      });
    }

    res.status(200).json({
      success: true,
      message: `${services.length} services found for ${gender}`,
      services: services,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Something went wrong while fetching services for ${gender}`,
    });
  }
};
