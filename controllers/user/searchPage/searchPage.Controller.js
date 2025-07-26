import Services from "../../../models/Service.js";
import BarberSetup from "../../../models/Barber.model.js";

/**
 * @des fetch all the shops according search term 
 * @route GET /api/user/search/search-services
 * @access  Private
 * @param {string} req.params - service name
 */
export const searchServices = async (req, res) => {
  try {
    const { query , gender  } = req.query; 

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    //  Step 1: Find matching services
    const services = await Services.find({
      serviceName: { $regex: query, $options: "i" }, 
      serviceFor: gender
    });

    if (!services.length) {
      return res.status(200).json({
        success: true,
        message: "No services found",
        data: [],
      });
    }

    //  Step 2: Get all unique firebaseUids
    const firebaseUids = [...new Set(services.map((s) => s.firebaseUid))];

    //  Step 3: Fetch shops for these UIDs
    const shops = await BarberSetup.find({
      firebaseUid: { $in: firebaseUids },
    });

    //  Step 4: Prepare structured response (no price, no duration)
    const result = services.map((service) => {
      const shop = shops.find((s) => s.firebaseUid === service.firebaseUid);

      return {
        _id: service._id,
        firebaseUid: service.firebaseUid,
        serviceFor: service.serviceFor,
        serviceName: service.serviceName,

        shop: shop
          ? {
              shopName: shop.shopName,
              address: shop.address,
              location: shop.location,
              phoneNumber: shop.phoneNumber,
              shopCategory: shop.shopCategory,
              coverUrl: shop.coverUrl || null,
            }
          : null,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Services fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error searching services:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
