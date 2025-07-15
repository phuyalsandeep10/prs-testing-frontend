/**
 * Phase 4B Day 2 Demo Component
 * Showcases optimistic updates, real-time sync, offline support, and performance monitoring
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Database, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  Monitor,
  Zap,
  Cloud,
  CloudOff,
  Eye
} from 'lucide-react';

// Import Phase 4B Day 2 systems
import { 
  useOptimisticMutation, 
  OptimisticPatterns, 
  useOptimisticUpdateMonitor,
  generateTempId,
  isOptimistic 
} from '@/lib/optimistic';
import { 
  useWebSocketConnection, 
  useCrossTabSync, 
  useRealtimeSync 
} from '@/lib/realtime';
import { 
  useNetworkStatus, 
  useOfflineQueue, 
  useBackgroundSync 
} from '@/lib/offline';
import { 
  usePerformanceMonitor, 
  useRealtimeMetrics, 
  usePerformanceAlerts 
} from '@/lib/monitoring';

// Sample API functions for demo
const mockApiCall = (delay: number = 1000) => 
  new Promise(resolve => setTimeout(resolve, delay));

const mockClient = {
  id: '1',
  client_name: 'Demo Client',
  email: 'demo@example.com',
  phone_number: '123-456-7890',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function Phase4BDemo() {
  const queryClient = useQueryClient();
  const [demoData, setDemoData] = useState([mockClient]);
  const [isOnlineSim, setIsOnlineSim] = useState(true);

  // Phase 4B Day 2 Hooks
  const networkStatus = useNetworkStatus();
  const offlineQueue = useOfflineQueue(queryClient);
  const backgroundSync = useBackgroundSync(queryClient);
  const performanceMonitor = usePerformanceMonitor(queryClient);
  const realtimeMetrics = useRealtimeMetrics(queryClient);
  const performanceAlerts = usePerformanceAlerts(queryClient);
  const optimisticMonitor = useOptimisticUpdateMonitor();
  const crossTabSync = useCrossTabSync();

  // WebSocket connection (for demo purposes)
  const webSocketStatus = useWebSocketConnection({
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/', // Use env var or fallback
  });

  // Optimistic update mutation
  const optimisticUpdate = useOptimisticMutation({
    mutationFn: async (variables: any) => {
      await mockApiCall(2000);
      return { ...mockClient, ...variables };
    },
    queryKey: ['demo-clients'],
    optimisticUpdateFn: (variables, previousData) => {
      if (Array.isArray(previousData)) {
        return previousData.map(client => 
          client.id === variables.id ? { ...client, ...variables } : client
        );
      }
      return { ...mockClient, ...variables };
    },
  });

  const handleOptimisticUpdate = () => {
    optimisticUpdate.mutate({
      id: '1',
      client_name: `Updated Client ${Date.now()}`,
      email: 'updated@example.com',
    });
  };

  const handleOfflineAction = () => {
    backgroundSync.queueAction({
      type: 'UPDATE',
      entityType: 'client',
      entityId: '1',
      data: { client_name: 'Offline Update' },
      endpoint: '/api/clients/1',
      method: 'PUT',
      maxRetries: 3,
      priority: 'high',
    });
  };

  const handleCrossTabSync = () => {
    crossTabSync.broadcast('data_sync', {
      type: 'client_updated',
      data: { ...mockClient, client_name: 'Cross-tab Update' },
    });
  };

  const simulateSlowQuery = () => {
    // This would trigger performance alerts
    queryClient.fetchQuery({
      queryKey: ['slow-query'],
      queryFn: () => mockApiCall(6000), // Slow query
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Phase 4B Day 2 Demo</h1>
        <p className="text-gray-600">
          Advanced caching features: Optimistic Updates, Real-time Sync, Offline Support & Performance Monitoring
        </p>
      </div>

      <Tabs defaultValue="optimistic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="optimistic">Optimistic Updates</TabsTrigger>
          <TabsTrigger value="realtime">Real-time Sync</TabsTrigger>
          <TabsTrigger value="offline">Offline Support</TabsTrigger>
          <TabsTrigger value="monitoring">Performance</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        {/* Optimistic Updates Tab */}
        <TabsContent value="optimistic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Optimistic Updates
              </CardTitle>
              <CardDescription>
                Immediate UI feedback with automatic rollback on failures
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge variant={optimisticMonitor.pendingCount > 0 ? "secondary" : "default"}>
                  {optimisticMonitor.pendingCount} Pending Updates
                </Badge>
                <Badge variant={optimisticMonitor.conflicts.size > 0 ? "destructive" : "default"}>
                  {optimisticMonitor.conflicts.size} Conflicts
                </Badge>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={handleOptimisticUpdate}
                  disabled={optimisticUpdate.isPending}
                  className="w-full"
                >
                  {optimisticUpdate.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Test Optimistic Update'
                  )}
                </Button>
                
                <Button 
                  onClick={() => optimisticMonitor.clearPending()}
                  variant="outline"
                  className="w-full"
                >
                  Clear Pending Updates
                </Button>
              </div>

              {optimisticMonitor.conflicts.size > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {optimisticMonitor.conflicts.size} conflicts detected. Manual resolution may be required.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Real-time Sync Tab */}
        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-time Synchronization
              </CardTitle>
              <CardDescription>
                WebSocket connection and cross-tab synchronization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {webSocketStatus.status === 'connected' ? (
                      <Wifi className="h-4 w-4 text-green-500" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm">WebSocket: {webSocketStatus.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Other Tabs: {crossTabSync.otherTabsCount}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    onClick={handleCrossTabSync}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Broadcast to Other Tabs
                  </Button>
                  <Button 
                    onClick={webSocketStatus.reconnect}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Reconnect WebSocket
                  </Button>
                </div>
              </div>

              {webSocketStatus.lastMessage && (
                <Alert>
                  <Eye className="h-4 w-4" />
                  <AlertDescription>
                    Last message: {webSocketStatus.lastMessage.type} at {new Date(webSocketStatus.lastMessage.timestamp).toLocaleTimeString()}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Offline Support Tab */}
        <TabsContent value="offline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {networkStatus.isOnline ? (
                  <Cloud className="h-5 w-5 text-green-500" />
                ) : (
                  <CloudOff className="h-5 w-5 text-red-500" />
                )}
                Offline Support
              </CardTitle>
              <CardDescription>
                Action queuing and background synchronization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={networkStatus.isOnline ? "default" : "destructive"}>
                      {networkStatus.isOnline ? "Online" : "Offline"}
                    </Badge>
                    {networkStatus.effectiveType && (
                      <Badge variant="outline">
                        {networkStatus.effectiveType}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Queue: {offlineQueue.queueStatus.totalActions} actions
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    onClick={handleOfflineAction}
                    size="sm"
                    className="w-full"
                  >
                    Queue Offline Action
                  </Button>
                  <Button 
                    onClick={backgroundSync.syncNow}
                    size="sm"
                    variant="outline"
                    className="w-full"
                  >
                    Sync Now
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sync Progress</span>
                  <span>{backgroundSync.syncProgress.completed}/{backgroundSync.syncProgress.total}</span>
                </div>
                <Progress 
                  value={backgroundSync.syncProgress.total > 0 ? 
                    (backgroundSync.syncProgress.completed / backgroundSync.syncProgress.total) * 100 : 0
                  } 
                />
              </div>

              {offlineQueue.queueStatus.failedActions > 0 && (
                <Alert>
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    {offlineQueue.queueStatus.failedActions} actions failed to sync
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Monitoring
              </CardTitle>
              <CardDescription>
                Real-time metrics and performance alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span>Active Queries:</span>
                      <span>{realtimeMetrics.activeQueries}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cache Hit Ratio:</span>
                      <span>{(realtimeMetrics.cacheHitRatio * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Query Time:</span>
                      <span>{realtimeMetrics.averageQueryTime.toFixed(0)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Error Rate:</span>
                      <span>{(realtimeMetrics.errorRate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    onClick={simulateSlowQuery}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Simulate Slow Query
                  </Button>
                  <Button 
                    onClick={performanceMonitor.clearMetrics}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Clear Metrics
                  </Button>
                </div>
              </div>

              {/* Performance Alerts */}
              <div className="space-y-2">
                <h4 className="font-medium">Recent Alerts</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {performanceAlerts.alerts.slice(0, 5).map((alert) => (
                    <Alert key={alert.id} className="py-2">
                      <AlertTriangle className="h-3 w-3" />
                      <AlertDescription className="text-xs">
                        {alert.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                  {performanceAlerts.alerts.length === 0 && (
                    <div className="text-sm text-gray-500">No recent alerts</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">All Systems Operational</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Cache Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(realtimeMetrics.cacheHitRatio * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Hit Ratio</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Network Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {networkStatus.isOnline ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {networkStatus.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Queue Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {offlineQueue.queueStatus.totalActions}
                </div>
                <div className="text-sm text-gray-600">Pending Actions</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Phase 4B Day 2 Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">✅ Implemented Features</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Optimistic Updates with rollback</li>
                    <li>• Real-time WebSocket synchronization</li>
                    <li>• Cross-tab data synchronization</li>
                    <li>• Offline action queuing</li>
                    <li>• Background sync mechanism</li>
                    <li>• Performance monitoring</li>
                    <li>• Cache hit/miss analytics</li>
                    <li>• Conflict resolution strategies</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">🎯 Key Benefits</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Instant UI feedback</li>
                    <li>• Seamless offline experience</li>
                    <li>• Real-time data consistency</li>
                    <li>• Automatic error handling</li>
                    <li>• Performance optimization</li>
                    <li>• Multi-tab synchronization</li>
                    <li>• Comprehensive monitoring</li>
                    <li>• Intelligent conflict resolution</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 