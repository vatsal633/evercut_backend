// models/UserModel.js - Enhanced with better validation and timestamps
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseUid: { 
    type: String, 
    required: true,
    unique: true,
    index: true // Add index for better query performance
  },
  phoneNumber: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v) {
        return /^\+?[1-9]\d{1,14}$/.test(v); // Basic phone number validation
      },
      message: 'Please enter a valid phone number'
    }
  },
  firstName: { 
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot be longer than 50 characters']
  },
  lastName: { 
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot be longer than 50 characters']
  },
  gender: {
    type: String,
    enum: {
      values: ['Male', 'Female', 'Other'],
      message: 'Gender must be Male, Female, or Other'
    }
  },
  dateOfBirth: { 
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty values
        // Basic date format validation (YYYY-MM-DD)
        return /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: 'Date of birth must be in YYYY-MM-DD format'
    }
  },
  address: { 
    type: String,
    trim: true,
    maxlength: [200, 'Address cannot be longer than 200 characters']
  },
  email: { 
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty values
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Create compound index for better query performance
userSchema.index({ firebaseUid: 1, isActive: 1 });

// Pre-save middleware to update lastLoginAt
userSchema.pre('findOneAndUpdate', function() {
  this.set({ lastLoginAt: new Date() });
});

// Instance method to get full name
userSchema.methods.getFullName = function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
};

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Virtual for profile completion percentage
userSchema.virtual('profileCompletion').get(function() {
  const fields = ['firstName', 'lastName', 'gender', 'dateOfBirth', 'address', 'email'];
  const completedFields = fields.filter(field => this[field] && this[field].trim() !== '').length;
  return Math.round((completedFields / fields.length) * 100);
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });

const User = mongoose.model('User', userSchema);

export default User;