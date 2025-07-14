import type { Notification } from '@/types';

class NotificationWebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Map<string, (notification: Notification) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnecting = false;

  connect(token: string) {
    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) return;

    this.isConnecting = true;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    
    // If WebSocket URL is not configured, skip connection
    if (!wsUrl) {
      console.log('🔌 WebSocket URL not configured. Real-time notifications disabled.');
      this.isConnecting = false;
      return;
    }
    
    try {
      this.socket = new WebSocket(`${wsUrl}?token=${token}`);

      this.socket.onopen = () => {
        console.log('🔌 Connected to notification service');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'notification') {
            this.notifyListeners(data.notification);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log('🔌 Disconnected from notification service:', event.code, event.reason);
        this.isConnecting = false;
        
        // Only attempt to reconnect if not a clean close and WebSocket URL is configured
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts && wsUrl) {
          const delay = Math.pow(2, this.reconnectAttempts) * 1000;
          this.reconnectTimeout = setTimeout(() => {
            this.reconnectAttempts++;
            this.connect(token);
          }, delay);
        }
      };

      this.socket.onerror = (error) => {
        console.log('🔌 WebSocket connection failed. Real-time notifications disabled.');
        this.isConnecting = false;
        // Don't attempt to reconnect on error - the backend might not support WebSocket
      };

    } catch (error) {
      console.log('🔌 Failed to establish WebSocket connection. Real-time notifications disabled.');
      this.isConnecting = false;
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  subscribe(listener: (notification: Notification) => void): string {
    const id = Math.random().toString(36).substr(2, 9);
    this.listeners.set(id, listener);
    return id;
  }

  unsubscribe(id: string) {
    this.listeners.delete(id);
  }

  private notifyListeners(notification: Notification) {
    this.listeners.forEach(listener => listener(notification));
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export const notificationWebSocket = new NotificationWebSocketService(); 