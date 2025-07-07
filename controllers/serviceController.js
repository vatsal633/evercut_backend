import Services from '../models/Service.js';

// CREATE a new service
export const addService = async (req, res) => {
  const firebaseUid = req.firebaseUser?.uid;

  const {
    serviceType,
    serviceName,
    duration,
    actualPrice,
    offerPrice,
    bundledServices, // Changed from bundledServicesName
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

      return res.status(201).json({ 
        message: 'Single service added successfully', 
        service 
      });
    }
    else if (serviceType === 'bundled') {
      const totalPrice = actualPrice + offerPrice;
      const service = await Services.create({
        firebaseUid,
        serviceType,
        serviceName,
        bundledServices, // Use bundledServices instead of bundledServicesName
        totalDuration,
        actualPrice,
        offerPrice,
        totalPrice,
      });

      return res.status(201).json({ 
        message: 'Bundled service added successfully', 
        service 
      });
    } else {
      return res.status(400).json({ message: 'Invalid service type' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding service' });
  }
};

// READ all services for a specific barber
export const getServices = async (req, res) => {
  const firebaseUid = req.firebaseUser?.uid;

  try {
    const services = await Services.find({ firebaseUid });
    res.status(200).json({
      message: 'Services retrieved successfully',
      services
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching services' });
  }
};

// UPDATE a specific service
export const updateService = async (req, res) => {
  const firebaseUid = req.firebaseUser?.uid;
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
  const firebaseUid = req.firebaseUser?.uid;
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
