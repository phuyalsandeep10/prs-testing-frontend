"use client";

import React, { createContext, useContext, useEffect } from 'react';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useUnreadCount } from '@/hooks/useNotifications';

interface NotificationContextType {
  unreadCount: number | undefined;
  isLoading: boolean;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: unreadCount, isLoading } = useUnreadCount();
  const { isConnected } = useRealtimeNotifications();

  return (
    <NotificationContext.Provider value={{ 
      unreadCount, 
      isLoading, 
      isConnected 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}; 