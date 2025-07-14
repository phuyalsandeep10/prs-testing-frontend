"use client";

import React, { useState, useEffect } from "react";
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from "@/hooks/useNotifications";
import type { Notification as NotificationType } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";

// Custom DialogContent without built-in close button for notifications
const NotificationContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-[10000] grid w-full gap-4 border bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
NotificationContent.displayName = "NotificationContent";

interface NotificationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  anchorRef?: React.RefObject<HTMLElement>;
}

const NotificationComponent: React.FC<NotificationProps> = ({
  isOpen,
  onOpenChange,
  anchorRef,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [position, setPosition] = useState({ top: 0, right: 0 });
  
  const { data: notificationsData, isLoading } = useNotifications({
    unread_only: filter === 'unread',
    type: typeFilter !== 'all' ? typeFilter : undefined,
    limit: 20
  });
  
  const { data: unreadCount } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

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

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate(undefined);
  };

  const handleNotificationClick = (notification: NotificationType) => {
    // Mark as read when clicked
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    
    // Navigate to action URL if available
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deal_created': return '📋';
      case 'deal_updated': return '📤';
      case 'deal_status_changed': return '✅';
      case 'client_created': return '👤';
      case 'user_created': return '👤';
      case 'team_created': return '👥';
      case 'payment_received': return '💰';
      case 'commission_created': return '💸';
      case 'system_alert': return '🔧';
      case 'new_organization': return '🏢';
      default: return '��';
    }
  };

  // Handle paginated response robustly
  let notifications: NotificationType[] = [];
  if (notificationsData) {
    if (Array.isArray(notificationsData)) {
      notifications = notificationsData;
    } else if (
      typeof notificationsData === 'object' &&
      notificationsData !== null &&
      'results' in notificationsData &&
      Array.isArray((notificationsData as { results: unknown }).results)
    ) {
      notifications = (notificationsData as { results: NotificationType[] }).results;
    } else if (
      typeof notificationsData === 'object' &&
      notificationsData !== null &&
      'data' in notificationsData &&
      Array.isArray((notificationsData as { data: unknown }).data)
    ) {
      notifications = (notificationsData as { data: NotificationType[] }).data;
    }
  }
  // notifications now always an array

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <NotificationContent
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
        <div className="px-6 py-[11px] border-b border-purple-100">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-[16px] font-medium text-gray-800 my-5">
                Notifications
                {unreadCount && unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Select value={filter} onValueChange={(value) => setFilter(value as 'all' | 'unread')}>
                  <SelectTrigger className="w-20 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="h-6 w-6 p-0 hover:bg-purple-200/50"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full h-10">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="deal_created">Deals</SelectItem>
              <SelectItem value="client_created">Clients</SelectItem>
              <SelectItem value="payment_received">Payments</SelectItem>
              <SelectItem value="user_created">Users</SelectItem>
              <SelectItem value="system_alert">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notifications List */}
        <div className="px-6 pb-[11px] max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start space-x-3 p-3 rounded-lg transition-all duration-200 cursor-pointer hover:bg-purple-50/50",
                    !notification.isRead && "bg-blue-50"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleNotificationClick(notification);
                    }
                  }}
                >
                  <div className="flex-shrink-0">
                    <span className="text-lg">{getTypeIcon(notification.notificationType)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </h4>
                      <div className={cn("w-2 h-2 rounded-full", getPriorityColor(notification.priority))} />
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : 'Unknown time'}
                      </span>
                      {notification.isRead && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="pt-4">
            <Button
              onClick={handleMarkAllAsRead}
              className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium h-[49px]"
              disabled={markAllAsRead.isPending}
            >
              {markAllAsRead.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Marking...
                </>
              ) : (
                'Mark all Read'
              )}
            </Button>
          </div>
        )}
      </NotificationContent>
    </Dialog>
  );
};

export default NotificationComponent;
