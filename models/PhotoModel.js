import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema({
  firebaseUid: { 
    type: String, 
    required: true,
    index: true // Add index for better query performance
  },
  
  photoUrl: { 
    type: String, 
    required: true 
  },
  
  photoName: { 
    type: String, 
    required: true 
  },
  
  photoType: {
    type: String,
    enum: ['shop_interior', 'shop_exterior', 'work_sample', 'team_photo', 'certificate', 'other'],
    default: 'other'
  },
  
  description: { 
    type: String,
    maxlength: 500 
  },
  
  fileSize: { 
    type: Number // Size in bytes
  },
  
  mimeType: { 
    type: String 
  },
  
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

// Add compound index for better query performance
photoSchema.index({ firebaseUid: 1, isActive: 1 });

// Add method to get photo count for a barber
photoSchema.statics.getPhotoCountByBarber = function(firebaseUid) {
  return this.countDocuments({ firebaseUid, isActive: true });
};

export default mongoose.model('Photo', photoSchema);