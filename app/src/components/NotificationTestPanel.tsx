'use client';

import { useState, useEffect } from 'react';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { notificationWebSocket } from '@/lib/realtime/notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function NotificationTestPanel() {
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);
  
  const { isConnected } = useRealtimeNotifications();

  useEffect(() => {
    const checkConnection = () => {
      if (notificationWebSocket.isConnected()) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    };

    const interval = setInterval(checkConnection, 1000);
    return () => clearInterval(interval);
  }, []);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testHeartbeat = () => {
    if (notificationWebSocket.isConnected()) {
      notificationWebSocket.sendHeartbeat();
      addTestResult('✅ Heartbeat sent');
    } else {
      addTestResult('❌ Not connected - cannot send heartbeat');
    }
  };

  const testNotificationCreation = async () => {
    try {
      const response = await fetch('/api/notifications/test/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          message: `Test notification at ${new Date().toLocaleTimeString()}`,
          notification_type: 'system_alert'
        }),
      });

      if (response.ok) {
        addTestResult('✅ Test notification created via API');
      } else {
        addTestResult('❌ Failed to create test notification');
      }
    } catch (error) {
      addTestResult(`❌ API Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      default: return 'bg-red-500';
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Real-time Notification Test Panel
          <Badge className={`${getStatusColor()} text-white`}>
            {connectionStatus}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">WebSocket Status:</p>
            <p className="text-sm text-muted-foreground">
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Environment:</p>
            <p className="text-sm text-muted-foreground">
              {process.env.NEXT_PUBLIC_WS_URL || 'Not configured'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={testHeartbeat} variant="outline" size="sm">
            Test Heartbeat
          </Button>
          <Button onClick={testNotificationCreation} variant="outline" size="sm">
            Create Test Notification
          </Button>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Test Results:</p>
          <div className="bg-muted p-3 rounded-md max-h-40 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tests run yet</p>
            ) : (
              testResults.map((result, index) => (
                <p key={index} className="text-xs font-mono">
                  {result}
                </p>
              ))
            )}
          </div>
        </div>

        {lastMessage && (
          <div>
            <p className="text-sm font-medium mb-2">Last Message:</p>
            <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
              {JSON.stringify(lastMessage, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}