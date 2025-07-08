import bcrypt from 'bcryptjs';

/**
 * PIN Validation Service
 * Handles all PIN-related validation and security operations for barbers
 */

/**
 * Validates PIN format
 * @param {string} pin - The PIN to validate
 * @returns {object} - Validation result with success status and message
 */
export const validatePinFormat = (pin) => {
  if (!pin) {
    return {
      isValid: false,
      message: 'PIN is required'
    };
  }

  const pinRegex = /^\d{4,6}$/;
  if (!pinRegex.test(pin)) {
    return {
      isValid: false,
      message: 'PIN must be 4-6 digits'
    };
  }

  return {
    isValid: true,
    message: 'PIN format is valid'
  };
};

/**
 * Validates PIN update request
 * @param {object} pinData - Object containing currentPin, newPin, confirmNewPin
 * @returns {object} - Validation result with success status and message
 */
export const validatePinUpdateRequest = (pinData) => {
  const { currentPin, newPin, confirmNewPin } = pinData;

  // Check if all required fields are provided
  if (!currentPin || !newPin || !confirmNewPin) {
    return {
      isValid: false,
      message: 'All PIN fields are required (currentPin, newPin, confirmNewPin)'
    };
  }

  // Validate new PIN format
  const newPinValidation = validatePinFormat(newPin);
  if (!newPinValidation.isValid) {
    return {
      isValid: false,
      message: `New PIN validation failed: ${newPinValidation.message}`
    };
  }

  // Check if new PIN and confirm PIN match
  if (newPin !== confirmNewPin) {
    return {
      isValid: false,
      message: 'New PIN and confirm PIN do not match'
    };
  }

  // Check if new PIN is different from current PIN
  if (currentPin === newPin) {
    return {
      isValid: false,
      message: 'New PIN must be different from current PIN'
    };
  }

  return {
    isValid: true,
    message: 'PIN update request is valid'
  };
};

/**
 * Verifies if the provided PIN matches the stored PIN
 * @param {string} storedPin - The PIN stored in database (could be hashed or plain text)
 * @param {string} inputPin - The PIN provided by user
 * @returns {Promise<boolean>} - True if PIN matches, false otherwise
 */
export const verifyPin = async (storedPin, inputPin) => {
  try {
    // Check if stored PIN is hashed (bcrypt hashes start with $2b$)
    if (storedPin.startsWith('$2b$')) {
      return await bcrypt.compare(inputPin, storedPin);
    } else {
      // For backward compatibility with plain text PINs
      return storedPin === inputPin;
    }
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return false;
  }
};

/**
 * Hashes a PIN using bcrypt
 * @param {string} pin - The plain text PIN to hash
 * @returns {Promise<string>} - The hashed PIN
 */
export const hashPin = async (pin) => {
  try {
    const saltRounds = 10;
    return await bcrypt.hash(pin, saltRounds);
  } catch (error) {
    console.error('Error hashing PIN:', error);
    throw new Error('Failed to hash PIN');
  }
};

/**
 * Validates PIN match during barber profile creation
 * @param {string} pin - The PIN
 * @param {string} confirmPin - The confirmation PIN
 * @returns {object} - Validation result
 */
export const validatePinCreation = (pin, confirmPin) => {
  // Check if PINs match
  if (pin !== confirmPin) {
    return {
      isValid: false,
      message: 'PINs do not match'
    };
  }

  // Validate PIN format
  const formatValidation = validatePinFormat(pin);
  if (!formatValidation.isValid) {
    return formatValidation;
  }

  return {
    isValid: true,
    message: 'PIN creation validation successful'
  };
};
