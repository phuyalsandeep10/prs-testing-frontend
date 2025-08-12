"use client";

import React, { useState, useEffect } from "react";
import styles from './Notification.module.css';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from "@/hooks/useNotifications";
import type { Notification as NotificationType } from "@/types";
import { formatDistanceToNow, startOfDay, isSameDay, subDays } from "date-fns";
import { Bell, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
  DialogHeader,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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

// Utility: group notifications by relative date labels
const groupByDate = (items: NotificationType[]): Record<string, NotificationType[]> => {
  const today = startOfDay(new Date());
  const yesterday = startOfDay(subDays(today, 1));
  return items.reduce<Record<string, NotificationType[]>>((acc, n) => {
    const created = n.createdAt ? new Date(n.createdAt) : new Date();
    let label = "Earlier";
    if (isSameDay(created, today)) label = "Today";
    else if (isSameDay(created, yesterday)) label = "Yesterday";
    if (!acc[label]) acc[label] = [];
    acc[label].push(n);
    return acc;
  }, {});
};

interface NotificationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  anchorRef?: React.RefObject<HTMLElement>;
}

// Define notification category type based on backend
export type NotificationCategory = 'all' | 'messages' | 'tasks' | 'alerts' | string;

// Tab type with category support
interface Tab {
  value: NotificationCategory;
  label: string;
  count: number;
}

const NotificationComponent: React.FC<NotificationProps> = ({
  isOpen,
  onOpenChange,
  anchorRef,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [position, setPosition] = useState({ top: 0, right: 0 });
  // Tabs (All, Messages, Tasks, Alerts)
  const [activeTab, setActiveTab] = useState<NotificationCategory>('all');

  
  const { data: notificationsData, isLoading } = useNotifications({
    unread_only: filter === 'unread',
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

  const categories = notifications.reduce<Record<string, { label: string; count: number }>>((acc, n) => {
    if (!acc[n.category]) {
      acc[n.category] = { count: 0, label: n.category.charAt(0).toUpperCase() + n.category.slice(1) };
    }
    if (!n.isRead) {
      acc[n.category].count++;
    }
    return acc;
  }, {});

  const tabs: Tab[] = [
    { value: 'all', label: 'All', count: unreadCount ?? 0 },
    ...Object.entries(categories).map(([category, data]) => ({
      value: category as NotificationCategory,
      label: data.label,
      count: data.count
    }))
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <NotificationContent
        className={`p-0 bg-white shadow-2xl w-[540px] max-w-[98vw] h-[700px] max-h-[95vh] rounded-2xl border border-gray-100 mx-auto mt-12 flex flex-col ${styles.notificationContent}`}
        style={{
          '--top': `${position.top}px`,
          '--right': `${position.right}px`,
        } as React.CSSProperties}
        onInteractOutside={(e) => {
          // Prevent closing when clicking on the bell icon
          if (anchorRef?.current?.contains(e.target as Node)) {
            e.preventDefault();
          }
        }}
      >
        {/* Accessibility: DialogTitle for screen readers */}
        <DialogTitle asChild>
          <VisuallyHidden>Notifications</VisuallyHidden>
        </DialogTitle>
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-3 border-b border-gray-100 w-full bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Notifications</h2>
          <button
            onClick={() => { window.location.href = '/notifications'; }}
            className="text-xs font-semibold text-blue-600 hover:underline tracking-wide uppercase"
          >
            VIEW ALL
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-8 pt-2 pb-2 border-b border-gray-100 select-none text-sm font-semibold w-full bg-white z-10 sticky top-0">
          {tabs.map((tab: Tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'relative px-2 py-1 rounded transition-colors duration-150',
                activeTab === tab.value
                  ? 'text-blue-700 font-bold border-b-2 border-blue-600 bg-transparent'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
              style={{ minWidth: 60, fontSize: '13px' }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 inline-flex items-center justify-center text-[11px] font-semibold bg-gray-200 text-blue-700 rounded px-1 min-w-[16px] h-[16px] align-middle">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div
          className="flex-1 px-0 py-0 overflow-y-auto focus:outline-none bg-gray-50"
          role="list"
          aria-live="polite"
        >
          {isLoading ? (
            <div className="space-y-4 py-8 px-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 w-full rounded-xl bg-gray-200/60 animate-pulse"
                />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-24 text-center text-gray-400 flex flex-col items-center justify-center">
              <Bell className="h-12 w-12 mx-auto mb-3 text-gray-200" />
              <p className="text-lg font-semibold">No notifications</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 px-8 py-4">
              {Object.entries(groupByDate(notifications)).map(([label, items]) => (
                <div key={label} className="mb-0 first:mt-0">
                  <p className="text-xs font-bold text-gray-400 mb-2 px-1 select-none uppercase tracking-widest">{label}</p>
                  <div className="flex flex-col gap-2">
                    {items.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm border border-gray-100 transition cursor-pointer hover:bg-blue-50 group",
                          !notification.isRead ? "border-l-4 border-blue-600" : "border-l-4 border-transparent"
                        )}
                        onClick={() => handleNotificationClick(notification)}
                        role="listitem"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleNotificationClick(notification);
                          }
                        }}
                      >
                        {/* Icon/avatar */}
                        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 text-xl font-bold">
                          {getTypeIcon(notification.notificationType)}
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-base font-semibold text-gray-900 truncate pr-4">
                              {notification.title}
                            </h4>
                            {!notification.isRead && <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-blue-50 text-blue-600 rounded-full">New</span>}
                          </div>
                          {notification.message && (
                            <p className="text-sm text-gray-500 mb-1 line-clamp-2">
                              {notification.message}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                            <span>
                              {notification.createdAt
                                ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                                : "Unknown time"}
                            </span>
                            <div className="flex gap-2">
                              {!notification.isRead && (
                                <button
                                  onClick={e => { e.stopPropagation(); handleMarkAsRead(notification.id); }}
                                  className="text-blue-600 font-semibold hover:underline px-2 py-0.5 rounded transition"
                                >
                                  Mark as read
                                </button>
                              )}
                              {notification.actionUrl && (
                                <button
                                  onClick={e => { e.stopPropagation(); window.location.href = notification.actionUrl; }}
                                  className="text-gray-500 hover:text-blue-600 hover:underline px-2 py-0.5 rounded transition"
                                >
                                  View
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="py-4 px-8 border-t border-gray-100 flex items-center justify-between bg-white rounded-b-2xl gap-4">
          <Button
            onClick={handleMarkAllAsRead}
            className="inline-flex items-center gap-1 text-blue-600 hover:underline text-base font-semibold bg-transparent p-0 shadow-none"
            disabled={markAllAsRead.isPending}
            variant="ghost"
          >
            {markAllAsRead.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Marking...
              </>
            ) : (
              'Mark all as read'
            )}
          </Button>
          {/* Load more button (if pagination is needed) */}
          {/* <Button className="text-gray-500 bg-gray-100 hover:bg-gray-200 font-semibold px-4 py-2 rounded-lg" onClick={handleLoadMore}>Load more</Button> */}
        </div>
      </NotificationContent>
    </Dialog>
  );
};

export default NotificationComponent;
