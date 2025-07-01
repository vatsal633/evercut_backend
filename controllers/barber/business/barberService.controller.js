// controllers/barber/business/barberService.controller.js
import Services from '../../../models/Service.js';

export const addService = async (req, res) => {
  const firebaseUid = req.firebaseUser?.uid || req.body.firebaseUid;

  const {
    serviceType,
    serviceName,
    duration,
    actualPrice,
    offerPrice,
    bundledServicesName,
    totalDuration,
  } = req.body;

  try {
    if (serviceType === 'single') {
      const finalPrice = actualPrice + offerPrice;
      const service = await Services.create({
        firebaseUid,
        serviceType,
        serviceName,
        duration,
        actualPrice,
        offerPrice,
        finalPrice,
      });
      console.log("single service")
      return res.status(201).json({ message: 'Single service added', service });
    }
    else if (serviceType === 'bundled') {
      const totalPrice = actualPrice + offerPrice;
      const service = await Services.create({
        firebaseUid,
        serviceType,
        serviceName,
        bundledServicesName,
        totalDuration,
        totalPrice,
      });
      console.log("bundle service")
      return res.status(201).json({ message: 'Bundled service added', service });
    } else {
      return res.status(400).json({ message: 'Invalid service type' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding service' });
  }
};

export const getAllServices = async (req, res) => {
  const firebaseUid = req.firebaseUser?.uid || req.body.firebaseUid;

  try {
    const services = await Services.find({ firebaseUid });
    res.status(200).json({ services });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error getting services' });
  }
};
