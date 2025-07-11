// controllers/barber/business/barberService.controller.js
import Services from '../../../models/Service.js';

export const addService = async (req, res) => {
  // const firebaseUid = req.firebaseUser?.uid || req.body.firebaseUid;
    const firebaseUid = req.firebaseUser?.firebaseUid || req.body.firebaseUid || "test_firebase_uid";

  const {
    serviceType,
     serviceFor,
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
         serviceFor,
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
         serviceFor,
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
  // const firebaseUid = req.firebaseUser?.uid || req.body.firebaseUid;
    const firebaseUid = req.firebaseUser?.firebaseUid || req.body.firebaseUid || "test_firebase_uid";

  try {
    const services = await Services.find({ firebaseUid });
    res.status(200).json({ services });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error getting services' });
  }
};


// UPDATE a specific service
export const updateService = async (req, res) => {
  // const firebaseUid = req.firebaseUser?.uid;
  const firebaseUid = req.firebaseUser?.firebaseUid || req.body.firebaseUid || "test_firebase_uid";
  const { id } = req.params;
  const updateData = req.body;

  try {
    const service = await Services.findOneAndUpdate(
      { _id: id, firebaseUid },
      updateData,
      { new: true }
    );

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.status(200).json({
      message: 'Service updated successfully',
      service
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating service' });
  }
};

// DELETE a specific service
export const deleteService = async (req, res) => {
  // const firebaseUid = req.firebaseUser?.uid;
  const firebaseUid = req.firebaseUser?.firebaseUid || req.body.firebaseUid || "test_firebase_uid";
  const { id } = req.params;

  try {
    const service = await Services.findOneAndDelete({
      _id: id,
      firebaseUid
    });

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.status(200).json({
      message: 'Service deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting service' });
  }
};