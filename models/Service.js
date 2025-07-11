import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true },

  serviceType: {
    type: String,
    enum: ['single', 'bundled'],
    required: true,
  },
   serviceFor: {
    type: String,
    enum: ['male', 'female', 'unisex' ],
    default: 'unisex',
  },

  serviceName: { type: String, required: true },

  // For single services
  duration: { type: Number },
  actualPrice: { type: Number },
  offerPrice: { type: Number },
  finalPrice: { type: Number },

  // For bundled services
  bundledServices: [{ type: String }], // Changed from bundledServicesName
  totalDuration: { type: Number },
  totalPrice: { type: Number },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Services', serviceSchema);