import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  // Determine which sessions to display
  const displayedSessions = showAll ? sessions : sessions.slice(0, 4);

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 font-outfit">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header Section */}
        <div className="flex items-center justify-center bg-white">
          <div className="text-center space-y-1">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full inline-block">
              <Session />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold bg-gradient-to-r text-black">
                Your Sessions
              </h1>
              <p className="text-[#A9A9A9] max-w-md mx-auto leading-relaxed text-[16px] font-medium">
                This is a list of devices that have logged into your account.
                Revoke any sessions that you do not recognize.
              </p>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <Card className="border-0 shadow-xl shadow-blue-100/50 bg-white backdrop-blur-sm">
          <h1 className="text-xl font-semibold mb-1">Devices</h1>
          <CardContent className="p-0">
            <div className="divide-gray-100/50">
              {displayedSessions.map((session) => (
                <div
                  key={session.id}
                  className="group pb-2 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Browser Icon */}
                      <div className="relative">
                        <div className="flex items-center justify-center p-3 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200/50 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                          {session.icon}
                        </div>
                      </div>

                      {/* Session Details */}
                      <div className="flex-1 space-y-1">
                        <h3 className="font-semibold text-gray-900 text-md">
                          {session.browser} on {session.device}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-1 gap-[2px] text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <code className="py-1 rounded text-xs font-mono text-gray-700">
                              {session.ipAddress}
                            </code>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-gray-700">
                              {session.lastActive}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-2">
                      <AlertDialog
                        open={
                          revokeDialogOpen && selectedSession === session.id
                        }
                        onOpenChange={handleDialogOpenChange}
                      >
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevoke(session.id)}
                            disabled={session.isCurrentDevice}
                            className="px-4 py-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md font-semibold text-md cursor-pointer"
                          >
                            {session.isCurrentDevice ? "Current" : "Revoke"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                          <AlertDialogHeader className="space-y-4">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                              <Shield className="w-6 h-6 text-red-600" />
                            </div>
                            <AlertDialogTitle className="text-center text-xl font-semibold text-gray-900">
                              Revoke Session
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-center text-gray-600 leading-relaxed">
                              Are you sure you want to revoke this session? This
                              will immediately log out this device and require
                              re-authentication.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="sm:space-x-2">
                            <AlertDialogCancel className="hover:bg-gray-100 transition-colors">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={confirmRevoke}
                              className="bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                            >
                              Revoke Session
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Show More Button */}
            {sessions.length > 4 && (
              <div className="flex justify-center pt-4 pb-2">
                <Button
                  variant="outline"
                  onClick={toggleShowAll}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 shadow-sm hover:shadow-md font-semibold"
                >
                  {showAll ? "Show Less" : `Show More (${sessions.length - 4})`}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Sessions;
