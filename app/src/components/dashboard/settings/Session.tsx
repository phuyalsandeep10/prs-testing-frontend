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
import { Shield } from "lucide-react";
import Chrome from "@/components/svg/Chrome";
import Safari from "@/components/svg/Safari";

interface SessionDevice {
  id: string;
  browser: string;
  device: string;
  ipAddress: string;
  icon: React.ReactNode;
  lastActive: string;
  isCurrentDevice?: boolean;
}

const Sessions = () => {
  const [sessions, setSessions] = useState<SessionDevice[]>([
    {
      id: "1",
      browser: "Chrome",
      icon: <Chrome />,
      device: "iPhone",
      ipAddress: "222.229.226.222",
      lastActive: "Nov 17, 2023",
      isCurrentDevice: true,
    },
    {
      id: "2",
      browser: "Chrome",
      icon: <Chrome />,
      device: "Lenovo",
      ipAddress: "222.225.228.223",
      lastActive: "Nov 17, 2023",
    },
    {
      id: "3",
      browser: "Safari",
      icon: <Safari />,
      device: "MacBook Pro",
      ipAddress: "222.225.225.222",
      lastActive: "Nov 17, 2023",
    },
    {
      id: "4",
      browser: "Safari",
      icon: <Safari />,
      device: "MacBook Pro",
      ipAddress: "222.229.225.222",
      lastActive: "Nov 17, 2023",
    },
    {
      id: "5",
      browser: "Chrome",
      icon: <Chrome />,
      device: "Desktop PC",
      ipAddress: "222.229.227.224",
      lastActive: "Nov 16, 2023",
    },
    {
      id: "6",
      browser: "Chrome",
      icon: <Chrome />,
      device: "Desktop PC",
      ipAddress: "222.229.227.224",
      lastActive: "Nov 16, 2023",
    },
    {
      id: "7",
      browser: "Chrome",
      icon: <Chrome />,
      device: "Desktop PC",
      ipAddress: "222.229.227.224",
      lastActive: "Nov 16, 2023",
    },
  ]);

  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const handleRevoke = (sessionId: string) => {
    setSelectedSession(sessionId);
    setRevokeDialogOpen(true);
  };

  const confirmRevoke = () => {
    if (selectedSession) {
      setSessions((prev) =>
        prev.filter((session) => session.id !== selectedSession)
      );
      setRevokeDialogOpen(false);
      setSelectedSession(null);
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

  const displayedSessions = showAll ? sessions : sessions.slice(0, 4);

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

      {/* Sessions List */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Devices ({sessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {displayedSessions.map((session, index) => (
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
                    {session.icon}
                  </div>

                  {/* Session Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {session.browser} on {session.device}
                      </h3>
                      {session.isCurrentDevice && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full border border-green-200">
                          <Shield className="w-3 h-3" />
                          Current Device
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-x-4">
                      <span>IP: {session.ipAddress}</span>
                      <span>Last active: {session.lastActive}</span>
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
                      disabled={session.isCurrentDevice}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {session.isCurrentDevice ? "Current" : "Revoke"}
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
                      >
                        Revoke Session
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}

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
              onClick={() => {
                setSessions(sessions.filter(session => session.isCurrentDevice));
              }}
            >
              Sign Out All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sessions;
