import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Session from "@/components/svg/Session";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Shield, Monitor, Smartphone, Tablet, Globe } from "lucide-react";
import Chrome from "@/components/svg/Chrome";
import Safari from "@/components/svg/Safari";
import { useSessionManagement } from "@/hooks/useSessions";
import { UserSession } from "@/types";

const getDeviceIcon = (userAgent: string) => {
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('ios')) {
    return <Smartphone className="w-5 h-5" />;
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    return <Tablet className="w-5 h-5" />;
  } else if (ua.includes('chrome') || ua.includes('firefox') || ua.includes('safari')) {
    return <Monitor className="w-5 h-5" />;
  }
  return <Globe className="w-5 h-5" />;
};

const getBrowserName = (userAgent: string) => {
  const ua = userAgent.toLowerCase();
  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari')) return 'Safari';
  if (ua.includes('edge')) return 'Edge';
  return 'Unknown Browser';
};

const getDeviceName = (userAgent: string) => {
  const ua = userAgent.toLowerCase();
  if (ua.includes('iphone')) return 'iPhone';
  if (ua.includes('ipad')) return 'iPad';
  if (ua.includes('android')) return 'Android Device';
  if (ua.includes('macintosh')) return 'Mac';
  if (ua.includes('windows')) return 'Windows PC';
  if (ua.includes('linux')) return 'Linux';
  return 'Unknown Device';
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

const Sessions = () => {
  const { sessions, isLoading, revokeSession, isRevoking, error } = useSessionManagement();
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);

  const handleRevoke = (sessionId: string) => {
    setSelectedSession(sessionId);
    setRevokeDialogOpen(true);
  };

  const confirmRevoke = async () => {
    if (selectedSession) {
      setRevokingSessionId(selectedSession);
      try {
        await revokeSession(selectedSession);
        setRevokeDialogOpen(false);
        setSelectedSession(null);
      } catch (error) {
        console.error('Failed to revoke session:', error);
      } finally {
        setRevokingSessionId(null);
      }
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setRevokeDialogOpen(open);
    if (!open) {
      setSelectedSession(null);
    }
  };

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  const handleSignOutAll = async () => {
    const sessionsToRevoke = sessions.filter(session => !session.is_current_session);
    for (const session of sessionsToRevoke) {
      try {
        await revokeSession(session.id);
      } catch (error) {
        console.error('Failed to revoke session:', error);
      }
    }
  };

  const displayedSessions = showAll ? sessions : sessions.slice(0, 4);

  if (isLoading) {
    return (
      <div className="space-y-6 font-outfit">
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
    <div className="space-y-6 font-outfit">
      {/* Header Section */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
              <Session />
            </div>
            Active Sessions
          </CardTitle>
          <p className="text-sm text-gray-600">
            This is a list of devices that have logged into your account. Revoke any sessions that you do not recognize.
          </p>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">
            Failed to load sessions. Please try again.
          </p>
        </div>
      )}

      {/* Sessions List */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Devices ({sessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No active sessions found</p>
            </div>
          ) : (
            displayedSessions.map((session: UserSession, index) => {
              const browser = getBrowserName(session.user_agent || '');
              const device = getDeviceName(session.user_agent || '');
              const icon = getDeviceIcon(session.user_agent || '');
              
              return (
                <div
                  key={session.id}
                  className={`p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors ${
                    index !== displayedSessions.length - 1 ? "mb-3" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Browser Icon */}
                      <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                        {icon}
                      </div>

                      {/* Session Details */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {browser} on {device}
                          </h3>
                          {session.is_current_session && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full border border-green-200">
                              <Shield className="w-3 h-3" />
                              Current Device
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-x-4">
                          <span>IP: {session.ip_address || 'Unknown'}</span>
                          <span>Last active: {formatDate(session.createdAt || '')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <AlertDialog
                      open={revokeDialogOpen && selectedSession === session.id}
                      onOpenChange={handleDialogOpenChange}
                    >
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevoke(session.id)}
                          disabled={session.is_current_session || revokingSessionId === session.id}
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {session.is_current_session 
                            ? "Current" 
                            : revokingSessionId === session.id 
                            ? "Revoking..." 
                            : "Revoke"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke Session</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to revoke this session? This will sign out the device and the user will need to sign in again.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={confirmRevoke}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={revokingSessionId === session.id}
                          >
                            {revokingSessionId === session.id ? "Revoking..." : "Revoke Session"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              );
            })
          )}

          {/* Show More/Less Button */}
          {sessions.length > 4 && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={toggleShowAll}
                className="text-[#4F46E5] border-[#4F46E5] hover:bg-[#4F46E5] hover:text-white"
              >
                {showAll ? "Show Less" : `Show ${sessions.length - 4} More Sessions`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Actions */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Security Actions
          </CardTitle>
          <p className="text-sm text-gray-600">
            Additional security options for your account
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
            <div>
              <h3 className="font-semibold text-gray-900">Sign out all devices</h3>
              <p className="text-sm text-gray-600 mt-1">
                This will sign out all devices except the current one
              </p>
            </div>
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              onClick={handleSignOutAll}
              disabled={isRevoking || sessions.filter(s => !s.is_current_session).length === 0}
            >
              {isRevoking ? "Signing Out..." : "Sign Out All"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sessions;
