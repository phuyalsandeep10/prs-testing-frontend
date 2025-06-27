"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  timestamp: string;
  isRead: boolean;
}

interface NotificationsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  anchorRef?: React.RefObject<HTMLElement>;
  notifications?: Notification[];
  onNotificationsChange?: (notifications: Notification[]) => void;
}

const defaultNotifications: Notification[] = [
  {
    id: "1",
    title: "Deal Amount Received",
    timestamp: "2m ago",
    isRead: false,
  },
  {
    id: "2",
    title: "Sales Lead is change for Client Apple.inc",
    timestamp: "5m ago",
    isRead: false,
  },
  {
    id: "3",
    title: "Deal Amount Received",
    timestamp: "10m ago",
    isRead: false,
  },
  {
    id: "4",
    title: "Sales Lead is change for Client Apple.inc",
    timestamp: "15m ago",
    isRead: false,
  },
  {
    id: "5",
    title: "Deal Amount Received",
    timestamp: "20m ago",
    isRead: false,
  },
  {
    id: "6",
    title: "Sales Lead is change for Client",
    timestamp: "25m ago",
    isRead: false,
  },
];

const Notifications: React.FC<NotificationsProps> = ({
  isOpen,
  onOpenChange,
  anchorRef,
  notifications: externalNotifications,
  onNotificationsChange,
}) => {
  const [internalNotifications, setInternalNotifications] =
    useState<Notification[]>(defaultNotifications);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  // Use external state if provided, otherwise use internal state
  const notifications = externalNotifications || internalNotifications;

  // Calculate position based on anchor element
  useEffect(() => {
    if (isOpen && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4, // 4px gap below the bell icon
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen, anchorRef]);

  const updateNotifications = (updatedNotifications: Notification[]) => {
    if (onNotificationsChange) {
      onNotificationsChange(updatedNotifications);
    } else {
      setInternalNotifications(updatedNotifications);
    }
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      isRead: true,
    }));
    updateNotifications(updatedNotifications);
  };

  const toggleNotificationRead = (id: string) => {
    const updatedNotifications = notifications.map((notification) =>
      notification.id === id && !notification.isRead
        ? { ...notification, isRead: true }
        : notification
    );
    updateNotifications(updatedNotifications);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 bg-gradient-to-b from-purple-50 via-white to-blue-50 border-0 shadow-xl w-[376px] h-[434px] max-w-[376px] max-h-[434px] rounded-lg"
        style={{
          position: "fixed",
          top: `${position.top}px`,
          right: `${position.right}px`,
          left: "auto",
          transform: "none",
          margin: 0,
        }}
        onInteractOutside={(e) => {
          // Prevent closing when clicking on the bell icon
          if (anchorRef?.current?.contains(e.target as Node)) {
            e.preventDefault();
          }
        }}
      >
        {/* Header */}
        <div className=" px-6 py-[11px] border-b border-purple-100">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-[16px] font-medium text-gray-800 my-5 ">
                Updates
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-6 w-6 p-0 hover:bg-purple-200/50"
              ></Button>
            </div>
          </DialogHeader>
        </div>

        {/* Notifications List */}
        <div className="px-6 pb-[11px] max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-200 cursor-pointer hover:bg-purple-50/50 ${
                  notification.isRead ? "opacity-60" : ""
                }`}
                onClick={() => toggleNotificationRead(notification.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleNotificationRead(notification.id);
                  }
                }}
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    notification.isRead ? "bg-gray-300" : "bg-[#465FFF]"
                  }`}
                ></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-black">
                    {notification.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {notification.timestamp}
                  </p>
                </div>
                {notification.isRead && (
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className=" pt-4 ">
          <Button
            onClick={markAllAsRead}
            className="w-full text-white font-medium h-[49px] "
          >
            Mark all Read
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Notifications;
