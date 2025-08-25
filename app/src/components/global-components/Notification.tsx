"use client";

import React, { useState, useEffect, useMemo } from "react";
import styles from './Notification.module.css';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from "@/hooks/useNotifications";
import type { Notification as NotificationType } from "@/types";
import { formatDistanceToNow, startOfDay, isSameDay, subDays } from "date-fns";
import { 
  Bell, 
  Check, 
  X, 
  Loader2, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Trash2, 
  Clock,
  Zap,
  Star,
  AlertTriangle,
  Activity,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

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

// Revolutionary Notification Content Component
const RevolutionaryContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay className="bg-slate-900/20 backdrop-blur-sm" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(styles.notificationContent, className)}
      {...props}
    >
      <div className={styles.matrixBackground} />
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
RevolutionaryContent.displayName = "RevolutionaryContent";

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

export type NotificationCategory = 'all' | 'messages' | 'tasks' | 'alerts' | string;

interface Tab {
  value: NotificationCategory;
  label: string;
  count: number;
  icon: React.ReactNode;
}

const NotificationComponent: React.FC<NotificationProps> = ({
  isOpen,
  onOpenChange,
  anchorRef,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const [activeTab, setActiveTab] = useState<NotificationCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

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
        top: rect.bottom + 8,
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
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const getHolographicIcon = (type: string) => {
    switch (type) {
      case 'deal_created': return '🚀';
      case 'deal_updated': return '📈';
      case 'deal_status_changed': return '⭐';
      case 'client_created': return '👤';
      case 'user_created': return '🆕';
      case 'team_created': return '👥';
      case 'payment_received': return '💎';
      case 'commission_created': return '💰';
      case 'system_alert': return '⚡';
      case 'new_organization': return '🏢';
      case 'test_notification': return '🧪';
      default: return '🔔';
    }
  };

  // Handle paginated response robustly
  let allNotifications: NotificationType[] = [];
  if (notificationsData) {
    if (Array.isArray(notificationsData)) {
      allNotifications = notificationsData;
    } else if (
      typeof notificationsData === 'object' &&
      notificationsData !== null &&
      'results' in notificationsData &&
      Array.isArray((notificationsData as { results: unknown }).results)
    ) {
      allNotifications = (notificationsData as { results: NotificationType[] }).results;
    } else if (
      typeof notificationsData === 'object' &&
      notificationsData !== null &&
      'data' in notificationsData &&
      Array.isArray((notificationsData as { data: unknown }).data)
    ) {
      allNotifications = (notificationsData as { data: NotificationType[] }).data;
    }
  }

  // Filter notifications based on search query and active tab
  const notifications = useMemo(() => {
    let filtered = allNotifications;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        n.notificationType.toLowerCase().includes(query)
      );
    }
    
    // Filter by active tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(n => n.category === activeTab);
    }
    
    return filtered;
  }, [allNotifications, searchQuery, activeTab]);

  const categories = allNotifications.reduce<Record<string, { label: string; count: number }>>((acc, n) => {
    if (!acc[n.category]) {
      acc[n.category] = { count: 0, label: n.category.charAt(0).toUpperCase() + n.category.slice(1) };
    }
    if (!n.isRead) {
      acc[n.category].count++;
    }
    return acc;
  }, {});

  const handleSelectNotification = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedNotifications);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedNotifications(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    setSelectedNotifications(new Set(unreadIds));
    setShowBulkActions(unreadIds.length > 0);
  };

  const handleClearSelection = () => {
    setSelectedNotifications(new Set());
    setShowBulkActions(false);
  };

  const handleBulkMarkAsRead = () => {
    selectedNotifications.forEach(id => {
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.isRead) {
        markAsRead.mutate(id);
      }
    });
    handleClearSelection();
  };

  const tabs: Tab[] = [
    { value: 'all', label: 'All', count: unreadCount ?? 0, icon: <Activity className="h-2.5 w-2.5" /> },
    ...Object.entries(categories).map(([category, data]) => {
      let icon = <Bell className="h-2.5 w-2.5" />;
      if (category === 'business') icon = <Star className="h-2.5 w-2.5" />;
      if (category === 'system') icon = <Settings className="h-2.5 w-2.5" />;
      if (category === 'security') icon = <AlertTriangle className="h-2.5 w-2.5" />;
      
      return {
        value: category as NotificationCategory,
        label: data.label,
        count: data.count,
        icon
      };
    })
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <RevolutionaryContent
        className="w-[372px] max-w-[98vw] h-[468px] max-h-[95vh] rounded-2xl mx-auto mt-8 flex flex-col overflow-hidden"
        style={{
          '--top': `${position.top}px`,
          '--right': `${position.right}px`,
        } as React.CSSProperties}
        onInteractOutside={(e) => {
          if (anchorRef?.current?.contains(e.target as Node)) {
            e.preventDefault();
          }
        }}
      >
        <DialogTitle asChild>
          <VisuallyHidden>Quantum Notifications</VisuallyHidden>
        </DialogTitle>

        {/* Revolutionary Header */}
        <div className={cn(styles.modernHeader, "px-5 pt-5 pb-4 w-full z-20 sticky top-0")}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={cn(styles.headerTitle, "text-lg font-black tracking-tight")}>
              🔔 Notifications
            </h2>
            
            <div className="flex items-center gap-3">
              {showBulkActions && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkMarkAsRead}
                    className={cn(styles.cyberpunkButton, "flex items-center gap-1")}
                  >
                    <Zap className="h-2 w-2" />
                    Process ({selectedNotifications.size})
                  </button>
                  <button
                    onClick={handleClearSelection}
                    className={cn(styles.cyberpunkButton, "!border-red-500 !text-red-400")}
                  >
                    <X className="h-2 w-2" />
                  </button>
                </div>
              )}
              
            </div>
          </div>
          
          {/* Quantum Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-2.5 w-2.5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(styles.quantumSearch, "pl-8 h-8 text-xs font-medium")}
            />
          </div>
        </div>

        {/* Floating Tabs */}
        <div className="px-5 pb-4 w-full z-10">
          <div className={styles.floatingTabs}>
            {tabs.map((tab: Tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  styles.floatingTab,
                  activeTab === tab.value ? styles.active : ""
                )}
              >
                <div className="flex items-center gap-2">
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={styles.glowingBadge}>
                      {tab.count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Neural Network Content */}
        <div className={cn(styles.neuralNetwork, "flex-1 overflow-y-auto mx-4 mb-4")}>
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(styles.loadingOrb, "h-14 w-full")}
                />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <div className={cn(styles.holographicIcon, "w-12 h-12 flex items-center justify-center text-2xl mb-4")}>
                🌌
              </div>
              <p className={cn(styles.emptyState, "text-sm font-bold mb-1")}>All Clear! ✨</p>
              <p className={cn(styles.textMuted, "text-xs")}>You're all caught up with your notifications</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {Object.entries(groupByDate(notifications)).map(([label, items]) => (
                <div key={label} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1" />
                    <h3 className={cn(styles.textMuted, "text-[10px] font-bold uppercase tracking-wider px-2")}>
                      {label}
                    </h3>
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent flex-1" />
                  </div>
                  
                  <div className="space-y-2">
                    {items.map((notification, index) => (
                      <div
                        key={notification.id}
                        className={cn(
                          styles.morphicCard,
                          !notification.isRead ? styles.unreadCard : "",
                          "flex items-center gap-3 p-3 cursor-pointer group"
                        )}
                        style={{
                          animationDelay: `${index * 100}ms`
                        }}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        {/* Bulk Selection Checkbox */}
                        {showBulkActions && (
                          <div className="flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={selectedNotifications.has(notification.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleSelectNotification(notification.id, e.target.checked);
                              }}
                              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                            />
                          </div>
                        )}
                        
                        {/* Holographic Icon */}
                        <div className={cn(styles.holographicIcon, "flex-shrink-0 w-10 h-10 flex items-center justify-center text-sm")}>
                          {getHolographicIcon(notification.notificationType)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-1">
                            <div className={cn(
                              styles.priorityOrb,
                              styles[notification.priority || 'medium']
                            )} />
                            
                            <div className="flex-1">
                              <h4 className={cn(styles.textTitle, "text-sm font-bold mb-1 line-clamp-1")}>
                                {notification.title}
                              </h4>
                              {!notification.isRead && (
                                <span className={styles.glowingBadge}>
                                  NEW
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {notification.message && (
                            <p className={cn(styles.textContent, "text-xs mb-2 line-clamp-2")}>
                              {notification.message}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className={cn(styles.textMuted, "text-[10px] flex items-center gap-1")}>
                              <Clock className="h-2 w-2" />
                              {notification.createdAt
                                ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                                : "Unknown time"}
                            </span>
                            
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!notification.isRead && (
                                <button
                                  onClick={e => { e.stopPropagation(); handleMarkAsRead(notification.id); }}
                                  className={styles.cyberpunkButton}
                                  title="Mark as read"
                                >
                                  <Check className="h-2 w-2" />
                                </button>
                              )}
                              
                              {notification.actionUrl && (
                                <button
                                  onClick={e => { e.stopPropagation(); window.location.href = notification.actionUrl!; }}
                                  className={styles.cyberpunkButton}
                                  title="View details"
                                >
                                  <Zap className="h-2 w-2" />
                                </button>
                              )}
                              
                              <button
                                onClick={e => { e.stopPropagation(); }}
                                className={styles.cyberpunkButton}
                                title="Options"
                              >
                                <MoreHorizontal className="h-2 w-2" />
                              </button>
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

        {/* Holographic Footer */}
        <div className={cn(styles.holoFooter, "py-3 px-5 flex items-center justify-between")}>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllAsRead}
              className={cn(styles.cyberpunkButton, "flex items-center gap-1")}
              disabled={markAllAsRead.isPending || notifications.filter(n => !n.isRead).length === 0}
            >
              {markAllAsRead.isPending ? (
                <>
                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Star className="h-2.5 w-2.5" />
                  Clear All
                </>
              )}
            </button>
            
            {!showBulkActions && notifications.filter(n => !n.isRead).length > 0 && (
              <button
                onClick={handleSelectAll}
                className={styles.cyberpunkButton}
              >
                <Activity className="h-2.5 w-2.5 mr-1" />
                Select Unread
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {searchQuery && (
              <div className={cn(styles.textMuted, "text-[10px]")}>
                {notifications.length} result{notifications.length !== 1 ? 's' : ''}
              </div>
            )}
            
            <div className={cn(styles.textAccent, "text-xs font-bold")}>
              {unreadCount ? `${unreadCount} unread` : 'All caught up! ✨'}
            </div>
          </div>
        </div>
      </RevolutionaryContent>
    </Dialog>
  );
};

export default NotificationComponent;