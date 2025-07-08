// Validation service for barber business operations

export const validateBusinessUpdate = (body) => {
  const allowedFields = [
    'shopName', 'numberOfEmployees', 'yearsOfExperience', 'shopOwner',
    'emailId', 'upiId', 'location', 'bio', 'shopCategory', 'facilities',
    'availableDays', 'openTime', 'closeTime', 'breakTimes'
  ];

  const updateData = {};
  const errors = [];

  for (const [key, value] of Object.entries(body)) {
    if (allowedFields.includes(key)) {
      // Validate specific fields
      if (key === 'shopCategory' && value) {
        const validCategories = ["Salon", "Beauty Parlour", "Barber", "Door-Step"];
        if (!validCategories.includes(value)) {
          errors.push(`Invalid shop category. Must be one of: ${validCategories.join(', ')}`);
          continue;
        }
      }

      if (key === 'numberOfEmployees' && value !== undefined) {
        const numEmployees = parseInt(value);
        if (isNaN(numEmployees) || numEmployees < 1) {
          errors.push('Number of employees must be a positive number');
          continue;
        }
        updateData[key] = numEmployees;
      } else if (key === 'yearsOfExperience' && value !== undefined) {
        const years = parseInt(value);
        if (isNaN(years) || years < 0) {
          errors.push('Years of experience must be a non-negative number');
          continue;
        }
        updateData[key] = years;
      } else if (key === 'emailId' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push('Invalid email format');
          continue;
        }
        updateData[key] = value;
      } else if (key === 'facilities' && Array.isArray(value)) {
        updateData[key] = value.filter(facility => facility && facility.trim());
      } else if (key === 'availableDays' && Array.isArray(value)) {
        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const invalidDays = value.filter(day => !validDays.includes(day));
        if (invalidDays.length > 0) {
          errors.push(`Invalid days: ${invalidDays.join(', ')}. Valid days are: ${validDays.join(', ')}`);
          continue;
        }
        updateData[key] = value;
      } else if (key === 'breakTimes' && Array.isArray(value)) {
        // Validate break times format
        const validBreakTimes = value.filter(bt =>
          bt && typeof bt === 'object' && bt.start && bt.end
        );
        updateData[key] = validBreakTimes;
      } else if (key === 'location' && value) {
        // Handle location field - convert object to string if needed
        if (typeof value === 'object') {
          updateData[key] = JSON.stringify(value);
        } else {
          updateData[key] = value;
        }
      } else if (value !== undefined && value !== null && value !== '') {
        updateData[key] = value;
      }
    }
  }

  return { updateData, errors };
};
