import type { Notification } from '@/types';

class NotificationWebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Map<string, (notification: Notification) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  private validateWebSocketUrl(url: string): boolean {
    try {
      const wsUrl = new URL(url);
      return wsUrl.protocol === 'ws:' || wsUrl.protocol === 'wss:';
    } catch {
      return false;
    }
  }

  connect(token: string) {
    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) return;

    this.isConnecting = true;
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    
    if (!wsUrl || !this.validateWebSocketUrl(wsUrl)) {
      console.warn('🔌 Invalid or missing WebSocket URL. Real-time notifications disabled.');
      this.isConnecting = false;
      return;
    }
    
    try {
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }

      // Fix: Use correct WebSocket path
      this.socket = new WebSocket(`${wsUrl}/notifications/?token=${token}`);
      
      this.socket.onopen = () => {
        console.log('🔌 Connected to notification service');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          if (data.type === 'notification') {
            this.notifyListeners(data.notification);
          } else if (data.type === 'notification_batch' && Array.isArray(data.notifications)) {
            data.notifications.forEach((n: Notification) => this.notifyListeners(n));
          } else if (data.type === 'pong') {
            // Handle heartbeat response
            console.log('🔌 Heartbeat received');
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error, 'Raw data:', event.data);
        }
      };

      this.socket.onclose = (event) => {
        console.log('🔌 Disconnected from notification service:', event.code, event.reason);
        this.isConnecting = false;
        this.stopHeartbeat();
        
        // Only attempt to reconnect if not a clean close and within retry limits
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts && wsUrl) {
          const delay = Math.min(Math.pow(2, this.reconnectAttempts) * 1000, 30000);
          console.log(`🔌 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
          
          this.reconnectTimeout = setTimeout(() => {
            this.reconnectAttempts++;
            this.connect(token);
          }, delay);
        }
      };

      this.socket.onerror = (error) => {
        console.error('🔌 WebSocket connection failed:', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('🔌 Failed to establish WebSocket connection:', error);
      this.isConnecting = false;
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 30000); // Send heartbeat every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  disconnect() {
    this.stopHeartbeat();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      // Remove all event listeners to prevent memory leaks
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }
    
    // Clear all listeners
    this.listeners.clear();
    
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

  // Add heartbeat method
  sendHeartbeat() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify({ type: 'ping' }));
      } catch (error) {
        console.error('Failed to send heartbeat:', error);
      }
    }
  }
}

export const notificationWebSocket = new NotificationWebSocketService(); 
