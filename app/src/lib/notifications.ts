import { useUIStore } from '@/stores/uiStore';

type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'denied' | 'rejected' | 'approved' | 'pending' | 'payment' | 'verification';

interface NotificationConfig {
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

/**
 * Utility class for creating dynamic toast notifications with appropriate colors
 */
export class NotificationManager {
  private addNotification: (notification: any) => void;

  constructor() {
    // This will be set when the hook is used in a component
    this.addNotification = useUIStore.getState().addNotification;
  }

  private showNotification(type: NotificationType, config: NotificationConfig) {
    this.addNotification({
      type,
      ...config,
    });
  }

  // Success states (Green)
  success(config: NotificationConfig) {
    this.showNotification('success', config);
  }

  approved(config: NotificationConfig) {
    this.showNotification('approved', config);
  }

  // Error states (Red)
  error(config: NotificationConfig) {
    this.showNotification('error', config);
  }

  denied(config: NotificationConfig) {
    this.showNotification('denied', config);
  }

  rejected(config: NotificationConfig) {
    this.showNotification('rejected', config);
  }

  // Warning states (Orange/Yellow)
  warning(config: NotificationConfig) {
    this.showNotification('warning', config);
  }

  pending(config: NotificationConfig) {
    this.showNotification('pending', config);
  }

  // Info states (Blue/Cyan)
  info(config: NotificationConfig) {
    this.showNotification('info', config);
  }

  verification(config: NotificationConfig) {
    this.showNotification('verification', config);
  }

  // Special states
  loading(config: NotificationConfig) {
    this.showNotification('loading', { ...config, duration: 0 }); // Loading toasts don't auto-dismiss
  }

  payment(config: NotificationConfig) {
    this.showNotification('payment', config);
  }
}

/**
 * Hook to use the notification manager in components
 */
export const useNotifications = () => {
  const { addNotification } = useUIStore();

  const showNotification = (type: NotificationType, config: NotificationConfig) => {
    addNotification({
      type,
      ...config,
    });
  };

  return {
    // Success states (Green)
    success: (config: NotificationConfig) => showNotification('success', config),
    approved: (config: NotificationConfig) => showNotification('approved', config),

    // Error states (Red)
    error: (config: NotificationConfig) => showNotification('error', config),
    denied: (config: NotificationConfig) => showNotification('denied', config),
    rejected: (config: NotificationConfig) => showNotification('rejected', config),

    // Warning states (Orange/Yellow)
    warning: (config: NotificationConfig) => showNotification('warning', config),
    pending: (config: NotificationConfig) => showNotification('pending', config),

    // Info states (Blue/Cyan)
    info: (config: NotificationConfig) => showNotification('info', config),
    verification: (config: NotificationConfig) => showNotification('verification', config),

    // Special states
    loading: (config: NotificationConfig) => showNotification('loading', { ...config, duration: 0 }),
    payment: (config: NotificationConfig) => showNotification('payment', config),

    // Generic method for custom types
    show: (type: NotificationType, config: NotificationConfig) => showNotification(type, config),
  };
};

/**
 * Predefined notification messages for common scenarios
 */
export const NotificationMessages = {
  // Success messages
  SUCCESS: {
    SAVED: { title: 'Saved', message: 'Changes have been saved successfully.' },
    CREATED: { title: 'Created', message: 'Item has been created successfully.' },
    UPDATED: { title: 'Updated', message: 'Item has been updated successfully.' },
    DELETED: { title: 'Deleted', message: 'Item has been deleted successfully.' },
  },

  // Approval messages
  APPROVED: {
    GENERAL: { title: 'Approved', message: 'Request has been approved.' },
    PAYMENT: { title: 'Payment Approved', message: 'Payment has been approved and processed.' },
    USER: { title: 'User Approved', message: 'User account has been approved.' },
  },

  // Error messages
  ERROR: {
    GENERAL: { title: 'Error', message: 'An unexpected error occurred.' },
    NETWORK: { title: 'Network Error', message: 'Failed to connect to server. Please try again.' },
    VALIDATION: { title: 'Validation Error', message: 'Please check your input and try again.' },
  },

  // Denial messages
  DENIED: {
    GENERAL: { title: 'Access Denied', message: 'You do not have permission to perform this action.' },
    PAYMENT: { title: 'Payment Denied', message: 'Payment was declined by the payment processor.' },
    LOGIN: { title: 'Login Denied', message: 'Invalid credentials. Please try again.' },
  },

  // Warning messages
  WARNING: {
    UNSAVED: { title: 'Unsaved Changes', message: 'You have unsaved changes that will be lost.' },
    LIMIT: { title: 'Limit Reached', message: 'You have reached the maximum limit.' },
  },

  // Pending messages
  PENDING: {
    REVIEW: { title: 'Pending Review', message: 'Submission is pending review.' },
    APPROVAL: { title: 'Pending Approval', message: 'Request is pending approval.' },
    PAYMENT: { title: 'Payment Pending', message: 'Payment is being processed.' },
  },

  // Info messages
  INFO: {
    UPDATE: { title: 'Update Available', message: 'A new update is available.' },
    MAINTENANCE: { title: 'Maintenance', message: 'Scheduled maintenance will begin soon.' },
  },

  // Loading messages
  LOADING: {
    SAVING: { title: 'Saving...', message: 'Please wait while we save your changes.' },
    LOADING: { title: 'Loading...', message: 'Please wait while we load your data.' },
    PROCESSING: { title: 'Processing...', message: 'Please wait while we process your request.' },
  },

  // Payment messages
  PAYMENT: {
    SUCCESS: { title: 'Payment Successful', message: 'Your payment has been processed successfully.' },
    RECEIVED: { title: 'Payment Received', message: 'Payment has been received and confirmed.' },
  },

  // Verification messages
  VERIFICATION: {
    EMAIL: { title: 'Email Verified', message: 'Your email address has been verified.' },
    PHONE: { title: 'Phone Verified', message: 'Your phone number has been verified.' },
    DOCUMENT: { title: 'Document Verified', message: 'Your document has been verified.' },
  },
};