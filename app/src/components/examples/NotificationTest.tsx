"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotificationManagement } from '@/hooks/useNotifications';
import { useNotificationContext } from '@/contexts/NotificationContext';
import { toast } from 'sonner';

const NotificationTest: React.FC = () => {
  const { 
    notifications, 
    stats, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead,
    refetch 
  } = useNotificationManagement();

  const { isConnected } = useNotificationContext();

  const handleTestNotification = () => {
    toast.success('Test notification sent!', {
      description: 'This is a test notification to verify the system is working.',
      duration: 5000,
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead(undefined);
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification System Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Connection Status</h3>
              <p className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Unread Count</h3>
              <p className="text-2xl font-bold text-blue-600">
                {unreadCount || 0}
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Total Notifications</h3>
              <p className="text-2xl font-bold text-gray-600">
                {notifications?.length || 0}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleTestNotification} variant="outline">
              Send Test Toast
            </Button>
            <Button onClick={handleMarkAllAsRead} variant="outline">
              Mark All as Read
            </Button>
            <Button onClick={() => refetch()} variant="outline">
              Refresh
            </Button>
          </div>

          {isLoading && (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading notifications...</p>
            </div>
          )}

          {stats && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Notification Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total</p>
                  <p className="font-semibold">{stats.totalNotifications}</p>
                </div>
                <div>
                  <p className="text-gray-600">Unread</p>
                  <p className="font-semibold">{stats.unreadCount}</p>
                </div>
                <div>
                  <p className="text-gray-600">By Type</p>
                  <p className="font-semibold">{Object.keys(stats.byType).length}</p>
                </div>
                <div>
                  <p className="text-gray-600">By Priority</p>
                  <p className="font-semibold">{Object.keys(stats.byPriority).length}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationTest; 