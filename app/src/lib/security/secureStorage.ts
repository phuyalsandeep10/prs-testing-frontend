/**
 * Enhanced localStorage with XSS protection and security features
 * This keeps your existing localStorage system but adds security layers
 */

export class SecureStorage {
  private static instance: SecureStorage;
  private readonly prefix = 'prs_secure_';

  private constructor() {}

  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  /**
   * Set item with XSS protection and validation
   */
  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;

    try {
      // Validate the value to prevent XSS injection
      const sanitizedValue = this.sanitizeValue(value);
      
      // Use prefixed key for namespace isolation
      const secureKey = this.prefix + key;
      
      // Store with timestamp for expiration handling
      const storageData = {
        value: sanitizedValue,
        timestamp: Date.now(),
        checksum: this.generateChecksum(sanitizedValue)
      };

      localStorage.setItem(secureKey, JSON.stringify(storageData));
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔒 Secure storage: ${key} saved`);
      }
    } catch (error) {
      console.error('Failed to set secure storage:', error);
    }
  }

  /**
   * Get item with integrity validation
   */
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;

    try {
      const secureKey = this.prefix + key;
      const storedData = localStorage.getItem(secureKey);
      
      if (!storedData) {
        // Fallback to non-prefixed key for backwards compatibility
        return localStorage.getItem(key);
      }

      const parsedData = JSON.parse(storedData);
      
      // Validate data integrity
      if (!this.validateIntegrity(parsedData)) {
        console.warn(`🔒 Storage integrity check failed for: ${key}`);
        this.removeItem(key);
        return null;
      }

      // Check if expired (24 hours for tokens)
      if (key === 'authToken' && this.isExpired(parsedData.timestamp, 24 * 60 * 60 * 1000)) {
        console.warn(`🔒 Token expired for: ${key}`);
        this.removeItem(key);
        return null;
      }

      return parsedData.value;
    } catch (error) {
      console.error('Failed to get secure storage:', error);
      // Fallback to regular localStorage
      return localStorage.getItem(key);
    }
  }

  /**
   * Remove item securely
   */
  removeItem(key: string): void {
    if (typeof window === 'undefined') return;

    try {
      const secureKey = this.prefix + key;
      localStorage.removeItem(secureKey);
      
      // Also remove any legacy keys
      localStorage.removeItem(key);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔒 Secure storage: ${key} removed`);
      }
    } catch (error) {
      console.error('Failed to remove secure storage:', error);
    }
  }

  /**
   * Sanitize value to prevent XSS
   */
  private sanitizeValue(value: string): string {
    // Remove potentially dangerous characters and scripts
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/data:text\/html/gi, '')
      .trim();
  }

  /**
   * Generate simple checksum for integrity validation
   */
  private generateChecksum(value: string): string {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Validate data integrity
   */
  private validateIntegrity(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    if (!data.value || !data.timestamp || !data.checksum) return false;
    
    const expectedChecksum = this.generateChecksum(data.value);
    return expectedChecksum === data.checksum;
  }

  /**
   * Check if timestamp is expired
   */
  private isExpired(timestamp: number, maxAge: number): boolean {
    return Date.now() - timestamp > maxAge;
  }

  /**
   * Clean up expired entries
   */
  cleanupExpired(): void {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(localStorage);
    const expiredKeys: string[] = [];

    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (this.isExpired(data.timestamp, 24 * 60 * 60 * 1000)) {
            expiredKeys.push(key);
          }
        } catch (error) {
          // Invalid data, mark for cleanup
          expiredKeys.push(key);
        }
      }
    });

    expiredKeys.forEach(key => localStorage.removeItem(key));
    
    if (expiredKeys.length > 0) {
      console.log(`🧹 Cleaned up ${expiredKeys.length} expired storage entries`);
    }
  }

  /**
   * Get storage statistics
   */
  getStats(): { totalKeys: number; secureKeys: number; storageUsed: number } {
    if (typeof window === 'undefined') {
      return { totalKeys: 0, secureKeys: 0, storageUsed: 0 };
    }

    const keys = Object.keys(localStorage);
    const secureKeys = keys.filter(key => key.startsWith(this.prefix));
    
    let storageUsed = 0;
    keys.forEach(key => {
      storageUsed += (localStorage.getItem(key) || '').length;
    });

    return {
      totalKeys: keys.length,
      secureKeys: secureKeys.length,
      storageUsed
    };
  }
}

// Create singleton instance
export const secureStorage = SecureStorage.getInstance();