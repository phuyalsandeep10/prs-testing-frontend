"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Monitor, Smartphone, Tablet, Globe, Calendar, Trash2 } from "lucide-react";
import { useSessionManagement } from "@/hooks/useSessions";
import { UserSession } from "@/types";

const getDeviceIcon = (device: string | any) => {
  // Handle case where device might be an object or null/undefined
  let deviceString = '';
  if (typeof device === 'string') {
    deviceString = device;
  } else if (device && typeof device === 'object') {
    // If device is an object, try to extract meaningful info
    deviceString = `${device.browser || ''} ${device.os || ''} ${device.device || ''}`.trim();
  } else {
    deviceString = String(device || '');
  }
  
  const lowerDevice = deviceString.toLowerCase();
  if (lowerDevice.includes('mobile') || lowerDevice.includes('android') || lowerDevice.includes('ios')) {
    return <Smartphone className="w-5 h-5" />;
  } else if (lowerDevice.includes('tablet') || lowerDevice.includes('ipad')) {
    return <Tablet className="w-5 h-5" />;
  } else if (lowerDevice.includes('chrome') || lowerDevice.includes('firefox') || lowerDevice.includes('safari')) {
    return <Monitor className="w-5 h-5" />;
  }
  return <Globe className="w-5 h-5" />;
};

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Unknown';
  }
};

export default function SessionsSettings() {
  const { sessions, isLoading, revokeSession, isRevoking, error } = useSessionManagement();
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);

  // Debug: Log the sessions data structure
  console.log('SessionsSettings - Sessions data:', sessions); // Debug log

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSessionId(sessionId);
    try {
      await revokeSession(sessionId);
    } finally {
      setRevokingSessionId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm font-outfit">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm font-outfit">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Active Sessions
      </h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">
            Failed to load sessions. Please try again.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No active sessions found</p>
          </div>
        ) : (
          sessions.map((session: UserSession) => (
            <Card key={session.id} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-gray-600">
                      {getDeviceIcon(session.device)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">
                          {typeof session.device === 'string' 
                            ? session.device 
                            : session.device && typeof session.device === 'object'
                            ? `${(session.device as any)?.browser || ''} ${(session.device as any)?.os || ''}`.trim() || 'Unknown Device'
                            : 'Unknown Device'
                          }
                        </h3>
                        {session.is_current_session && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Current Session
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Globe className="w-3 h-3" />
                          <span>{session.ip_address || 'Unknown IP'}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(session.createdAt || '')}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {!session.is_current_session && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeSession(session.id)}
                      disabled={revokingSessionId === session.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {revokingSessionId === session.id ? 'Revoking...' : 'Revoke'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {sessions.length > 1 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Security Tip:</strong> If you see any unfamiliar sessions, revoke them immediately 
            and consider changing your password.
          </p>
        </div>
      )}
    </div>
  );
} 