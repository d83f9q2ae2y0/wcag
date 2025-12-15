// src/utils/jsonArrayValidator.js

/**
 * Validates a JSON array with the same rules as the Symfony backend
 * Returns an object with { isValid: boolean, errors: array }
 */
export const validateJsonArray = (data) => {
  const errors = [];

  // Validate base fields
  const baseErrors = validateBaseFields(data);
  errors.push(...baseErrors);

  // If base validation fails, return early
  if (baseErrors.length > 0) {
    return {
      isValid: false,
      errors
    };
  }

  // Additional validation when ccc = 11
  if (data.ccc === 11) {
    const ccc11Errors = validateCccEquals11(data);
    errors.push(...ccc11Errors);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates base fields (aaa, bbb, ccc)
 */
const validateBaseFields = (data) => {
  const errors = [];

  // Validate 'aaa' - must be a valid datetime
  if (!data.aaa) {
    errors.push({
      property: 'aaa',
      message: 'This field is required'
    });
  } else if (!isValidDateTime(data.aaa)) {
    errors.push({
      property: 'aaa',
      message: 'This value is not a valid datetime'
    });
  }

  // Validate 'bbb' - must be a non-empty string
  if (!data.bbb) {
    errors.push({
      property: 'bbb',
      message: 'This field is required'
    });
  } else if (typeof data.bbb !== 'string') {
    errors.push({
      property: 'bbb',
      message: 'This value must be a string'
    });
  }

  // Validate 'ccc' - must be 10 or 11
  if (data.ccc === undefined || data.ccc === null) {
    errors.push({
      property: 'ccc',
      message: 'This field is required'
    });
  } else if (![10, 11].includes(data.ccc)) {
    errors.push({
      property: 'ccc',
      message: 'This value must be either 10 or 11'
    });
  }

  return errors;
};

/**
 * Validates additional constraints when ccc = 11
 */
const validateCccEquals11 = (data) => {
  const errors = [];

  // Validate that 'ddd' exists and is an array
  if (!data.ddd) {
    errors.push({
      property: 'ddd',
      message: 'The field "ddd" is required when ccc = 11'
    });
    return errors;
  }

  if (!Array.isArray(data.ddd)) {
    errors.push({
      property: 'ddd',
      message: 'The field "ddd" must be an array'
    });
    return errors;
  }

  // Validate each item in the 'ddd' array
  data.ddd.forEach((item, index) => {
    const itemErrors = validateDddItem(item, index);
    errors.push(...itemErrors);
  });

  return errors;
};

/**
 * Validates a single item in the 'ddd' array
 */
const validateDddItem = (item, index) => {
  const errors = [];

  // Validate 'zzz' - must be an integer
  if (item.zzz === undefined || item.zzz === null) {
    errors.push({
      property: `ddd[${index}].zzz`,
      message: `ddd[${index}].zzz is required`
    });
  } else if (!Number.isInteger(item.zzz)) {
    errors.push({
      property: `ddd[${index}].zzz`,
      message: `ddd[${index}].zzz must be an integer`
    });
  }
  // Note: Entity existence validation should be done on the backend
  // Frontend can optionally check against a list of valid IDs if available

  // Validate 'yyy' - must be an integer
  if (item.yyy === undefined || item.yyy === null) {
    errors.push({
      property: `ddd[${index}].yyy`,
      message: `ddd[${index}].yyy is required`
    });
  } else if (!Number.isInteger(item.yyy)) {
    errors.push({
      property: `ddd[${index}].yyy`,
      message: `ddd[${index}].yyy must be an integer`
    });
  }

  // Validate 'xxx' - must be a positive integer
  if (item.xxx === undefined || item.xxx === null) {
    errors.push({
      property: `ddd[${index}].xxx`,
      message: `ddd[${index}].xxx is required`
    });
  } else if (!Number.isInteger(item.xxx)) {
    errors.push({
      property: `ddd[${index}].xxx`,
      message: `ddd[${index}].xxx must be an integer`
    });
  } else if (item.xxx <= 0) {
    errors.push({
      property: `ddd[${index}].xxx`,
      message: `ddd[${index}].xxx must be positive`
    });
  }

  // Validate 'www' - must be a non-empty string
  if (!item.www) {
    errors.push({
      property: `ddd[${index}].www`,
      message: `ddd[${index}].www is required and cannot be empty`
    });
  } else if (typeof item.www !== 'string') {
    errors.push({
      property: `ddd[${index}].www`,
      message: `ddd[${index}].www must be a string`
    });
  }

  return errors;
};

/**
 * Validates if a string is a valid datetime
 * Accepts various formats: ISO 8601, common date formats, etc.
 */
const isValidDateTime = (value) => {
  if (typeof value !== 'string') {
    return false;
  }

  // Try to parse the date
  const date = new Date(value);
  
  // Check if it's a valid date
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Optional: Validates entity existence against a list of valid IDs
 * Call this if you have the valid entity IDs available on the frontend
 */
export const validateWithEntityIds = (data, validZzzIds = [], validYyyIds = []) => {
  const result = validateJsonArray(data);
  
  if (data.ccc === 11 && Array.isArray(data.ddd) && (validZzzIds.length > 0 || validYyyIds.length > 0)) {
    data.ddd.forEach((item, index) => {
      if (validZzzIds.length > 0 && !validZzzIds.includes(item.zzz)) {
        result.errors.push({
          property: `ddd[${index}].zzz`,
          message: `ddd[${index}].zzz references an invalid entity`
        });
      }
      
      if (validYyyIds.length > 0 && !validYyyIds.includes(item.yyy)) {
        result.errors.push({
          property: `ddd[${index}].yyy`,
          message: `ddd[${index}].yyy references an invalid entity`
        });
      }
    });
    
    result.isValid = result.errors.length === 0;
  }
  
  return result;
};

// src/hooks/useJsonArrayValidation.js

import { useState, useCallback } from 'react';
import { validateJsonArray, validateWithEntityIds } from '../utils/jsonArrayValidator';

/**
 * Custom hook for JSON array validation
 * Provides validation state and helper functions
 */
export const useJsonArrayValidation = (validZzzIds = [], validYyyIds = []) => {
  const [errors, setErrors] = useState([]);
  const [isValid, setIsValid] = useState(true);

  /**
   * Validates the data and updates state
   * Returns true if valid, false if invalid
   */
  const validate = useCallback((data) => {
    let result;
    
    // Use entity validation if valid IDs are provided
    if (validZzzIds.length > 0 || validYyyIds.length > 0) {
      result = validateWithEntityIds(data, validZzzIds, validYyyIds);
    } else {
      result = validateJsonArray(data);
    }
    
    setErrors(result.errors);
    setIsValid(result.isValid);
    
    return result.isValid;
  }, [validZzzIds, validYyyIds]);

  /**
   * Clears all validation errors
   */
  const clearErrors = useCallback(() => {
    setErrors([]);
    setIsValid(true);
  }, []);

  /**
   * Gets errors for a specific field
   */
  const getFieldErrors = useCallback((fieldName) => {
    return errors.filter(error => error.property === fieldName);
  }, [errors]);

  /**
   * Checks if a specific field has errors
   */
  const hasFieldError = useCallback((fieldName) => {
    return errors.some(error => error.property === fieldName);
  }, [errors]);

  return {
    errors,
    isValid,
    validate,
    clearErrors,
    getFieldErrors,
    hasFieldError
  };
};
