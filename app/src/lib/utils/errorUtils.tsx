/**
 * Utility functions for safe error handling and rendering
 */
import React from 'react';

/**
 * Safely extracts a displayable error message from various error types
 * @param error - The error object, string, or unknown type
 * @returns A safe string to display to users
 */
export function getDisplayableError(error: unknown): string {
  if (!error) {
    return 'An unknown error occurred';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message || 'An error occurred';
  }

  if (typeof error === 'object' && error !== null) {
    // Handle ApiError-like objects with message property
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    
    // Handle objects with error property
    if ('error' in error) {
      return getDisplayableError(error.error);
    }

    // Handle objects with detail property (common in API responses)
    if ('detail' in error && typeof error.detail === 'string') {
      return error.detail;
    }

    // Last resort - stringify the object (but this might still show [object Object])
    try {
      return JSON.stringify(error);
    } catch {
      return 'An error occurred (unable to parse error details)';
    }
  }

  // Fallback for any other type
  return String(error);
}

/**
 * Safely formats an error for console logging
 * @param error - The error to log
 * @returns A detailed error object safe for console.error
 */
export function getLoggableError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error as any).code && { code: (error as any).code },
      ...(error as any).status && { status: (error as any).status },
    };
  }

  if (typeof error === 'object' && error !== null) {
    return error;
  }

  return { message: String(error) };
}

/**
 * React-safe error component wrapper
 * Use this in JSX to safely render error objects
 */
export function SafeErrorDisplay({ error, prefix = 'Error: ' }: { error: unknown; prefix?: string }): React.ReactElement {
  const displayMessage = getDisplayableError(error);
  return <span>{prefix}{displayMessage}</span>;
}