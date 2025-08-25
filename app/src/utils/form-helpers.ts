import { FieldError, FieldErrorsImpl, Merge } from 'react-hook-form';

/**
 * Safely extracts error messages from React Hook Form errors
 * Handles different error types and provides fallbacks
 */
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message && typeof error.message === 'string') return error.message;
  if (error?.type) return `Validation error: ${error.type}`;
  return '';
};

/**
 * Safely extracts error messages for display in React components
 * Returns a string that can be safely rendered as ReactNode
 */
export const getErrorDisplayMessage = (error: any): string => {
  return getErrorMessage(error);
};

/**
 * Type-safe error message extraction for form fields
 * Handles FieldError, Merge<FieldError, FieldErrorsImpl<any>>, and other error types
 */
export const getFieldErrorMessage = (
  error: string | FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined
): string => {
  if (typeof error === 'string') return error;
  if (error?.message && typeof error.message === 'string') return error.message;
  if (error?.type) return `Validation error: ${error.type}`;
  return '';
};

/**
 * Creates a safe error object for form components
 * Ensures the error object has the required properties
 */
export const createSafeFieldError = (
  error: string | FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined
): FieldError | undefined => {
  if (typeof error === 'string') {
    return {
      type: 'manual' as const,
      message: error,
    };
  }
  if (error?.message && typeof error.message === 'string') {
    return {
      type: (error.type as any) || 'manual' as const,
      message: error.message,
    };
  }
  return undefined;
};

/**
 * Enhanced error message extractor that handles all error type scenarios
 * Provides comprehensive error handling for different error formats
 */
export const extractErrorMessage = (error: unknown): string => {
  if (!error) return 'An unknown error occurred';
  
  if (typeof error === 'string') return error;
  
  if (error instanceof Error) return error.message || 'An error occurred';
  
  if (typeof error === 'object' && error !== null) {
    // Handle React Hook Form errors
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    
    // Handle API error responses
    if ('detail' in error && typeof error.detail === 'string') {
      return error.detail;
    }
    
    // Handle validation errors
    if ('errors' in error && Array.isArray(error.errors)) {
      const firstError = error.errors[0];
      if (typeof firstError === 'string') return firstError;
      if (typeof firstError === 'object' && firstError?.message) {
        return String(firstError.message);
      }
    }
    
    // Handle field-specific errors
    if ('non_field_errors' in error && Array.isArray(error.non_field_errors)) {
      return error.non_field_errors[0] || 'Validation error occurred';
    }
    
    // Handle objects with error property
    if ('error' in error) {
      return extractErrorMessage(error.error);
    }
    
    // Last resort - try to stringify
    try {
      const stringified = JSON.stringify(error);
      if (stringified !== '{}' && stringified !== '[]') {
        return stringified;
      }
    } catch {
      // Ignore JSON.stringify errors
    }
  }
  
  return String(error);
};

/**
 * Type-safe field error handler for React Hook Form
 * Converts any error type to a safe FieldError
 */
export const normalizeFieldError = (
  error: unknown
): FieldError | undefined => {
  const message = extractErrorMessage(error);
  
  if (!message || message === 'An unknown error occurred') {
    return undefined;
  }
  
  return {
    type: 'manual',
    message,
  };
};

/**
 * Batch error normalizer for multiple form fields
 * Useful for handling API validation errors
 */
export const normalizeFormErrors = (
  errors: Record<string, unknown>
): Record<string, FieldError | undefined> => {
  const normalized: Record<string, FieldError | undefined> = {};
  
  for (const [field, error] of Object.entries(errors)) {
    normalized[field] = normalizeFieldError(error);
  }
  
  return normalized;
};

/**
 * Safe error message renderer for React components
 * Ensures error messages are always safely displayed
 */
export const renderErrorMessage = (error: unknown): string => {
  const message = extractErrorMessage(error);
  return message || 'An error occurred';
};

/**
 * Validation error formatter for user-friendly display
 * Converts technical error messages to user-readable format
 */
export const formatValidationError = (field: string, error: unknown): string => {
  const message = extractErrorMessage(error);
  
  if (message.includes('required') || message.includes('blank')) {
    return `${field} is required`;
  }
  
  if (message.includes('invalid')) {
    return `${field} format is invalid`;
  }
  
  if (message.includes('too_short') || message.includes('min_length')) {
    return `${field} is too short`;
  }
  
  if (message.includes('too_long') || message.includes('max_length')) {
    return `${field} is too long`;
  }
  
  if (message.includes('already_taken') || message.includes('unique')) {
    return `${field} is already taken`;
  }
  
  return message;
};
