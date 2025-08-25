"use client";

import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Update from "@/components/global-components/Update";
import { useNotificationPreferencesManagement } from "@/hooks/useNotificationPreferences";
import Settingnotification from "@/components/svg/SettingNotification";
import Settingmessage from "@/components/svg/SettingMessage";
import Settingsound from "@/components/svg/SettingSound";

interface NotificationState {
  desktopNotification: boolean;
  unreadNotificationBadge: boolean;
  pushNotificationTimeout: string;
  communicationEmails: boolean;
  announcementsUpdates: boolean;
  allNotificationSounds: boolean;
}

const NotificationSettings: React.FC = () => {
  const { 
    preferences, 
    isLoading, 
    updatePreferences, 
    isUpdating, 
    fetchError, 
    isFetchError, 
    updateError, 
    isUpdateError 
  } = useNotificationPreferencesManagement();

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [settings, setSettings] = useState<NotificationState>({
    desktopNotification: true,
    unreadNotificationBadge: false,
    pushNotificationTimeout: "select",
    communicationEmails: true,
    announcementsUpdates: false,
    allNotificationSounds: true,
  });

  // Load preferences when available
  useEffect(() => {
    console.log('NotificationSettings - Preferences changed:', preferences); // Debug log
    console.log('NotificationSettings - isLoading:', isLoading); // Debug log
    
    if (preferences) {
      const newSettings = {
        desktopNotification: preferences.desktopNotification,
        unreadNotificationBadge: preferences.unreadNotificationBadge,
        pushNotificationTimeout: preferences.pushNotificationTimeout,
        communicationEmails: preferences.communicationEmails,
        announcementsUpdates: preferences.announcementsUpdates,
        allNotificationSounds: preferences.allNotificationSounds,
      };
      
      console.log('NotificationSettings - Setting new settings:', newSettings); // Debug log
      console.log('NotificationSettings - Current settings before update:', settings); // Debug log
      setSettings(newSettings);
      
      // Log after a brief delay to confirm state was updated
      setTimeout(() => {
        console.log('NotificationSettings - Settings after update:', settings); // Debug log
      }, 100);
    } else {
      console.log('NotificationSettings - No preferences data available'); // Debug log
    }
  }, [preferences, isLoading]);

  const updateSetting = (
    key: keyof NotificationState,
    value: boolean | string
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleUpdateClick = () => {
    setIsUpdateModalOpen(true);
  };

  const handleConfirmUpdate = () => {
    console.log('NotificationSettings - Updating with settings:', settings); // Debug log
    updatePreferences(settings);
    setIsUpdateModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 font-outfit">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdateClick();
  };

  return (
    <>
      <form onSubmit={handleFormSubmit} className="space-y-6 font-outfit">
        {isFetchError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">
              Failed to load notification preferences. Please refresh the page.
            </p>
          </div>
        )}
        {isUpdateError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">
              Failed to update notification preferences. Please try again.
            </p>
          </div>
        )}

        {/* Notifications Section */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
              <Settingnotification />
              Notifications
            </CardTitle>
            <p className="text-sm text-gray-600">
              Configure how you receive notifications
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable Desktop Notification */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label className="text-base font-semibold text-gray-900">
                  Enable Desktop Notification
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Receive notifications for messages, contracts, and documents.
                </p>
              </div>
              <Switch
                checked={settings.desktopNotification}
                onCheckedChange={(checked: boolean) =>
                  updateSetting("desktopNotification", checked)
                }
                className="shrink-0 data-[state=checked]:bg-[#4F46E5]"
              />
            </div>

            {/* Enable Unread Notification Badge */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label className="text-base font-semibold text-gray-900">
                  Enable Unread Notification Badge
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Shows a red badge on the app icon when you have unread messages.
                </p>
              </div>
              <Switch
                checked={settings.unreadNotificationBadge}
                onCheckedChange={(checked: boolean) =>
                  updateSetting("unreadNotificationBadge", checked)
                }
                className="shrink-0 data-[state=checked]:bg-[#4F46E5]"
              />
            </div>

            {/* Push Notification Time-Out */}
            <div className="space-y-2">
              <Label className="text-base font-semibold text-gray-900">
                Push Notification Time-Out
              </Label>
              <select
                value={settings.pushNotificationTimeout}
                onChange={(e) =>
                  updateSetting("pushNotificationTimeout", e.target.value)
                }
                className="h-12 w-full border border-gray-300 rounded-lg px-3 text-sm text-gray-700 focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
              >
                <option value="select">Select the Option</option>
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">1 Hour</option>
                <option value="1days">1 Day</option>
                <option value="7days">7 Days</option>
                <option value="never">Never</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Email Notifications Section */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
              <Settingmessage />
              Email Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Communication Emails */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label className="text-base font-semibold text-gray-900">
                  Communication Emails
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Receive email for messages, contracts, and documents.
                </p>
              </div>
              <Switch
                checked={settings.communicationEmails}
                onCheckedChange={(checked: boolean) =>
                  updateSetting("communicationEmails", checked)
                }
                className="shrink-0 data-[state=checked]:bg-[#4F46E5]"
              />
            </div>

            {/* Announcements & Updates */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label className="text-base font-semibold text-gray-900">
                  Announcements & Updates
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Receive email for updates, improvements, news, etc.
                </p>
              </div>
              <Switch
                checked={settings.announcementsUpdates}
                onCheckedChange={(checked: boolean) =>
                  updateSetting("announcementsUpdates", checked)
                }
                className="shrink-0 data-[state=checked]:bg-[#4F46E5]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sounds Section */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-3">
              <Settingsound />
              Sounds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Label className="text-base font-semibold text-gray-900">
                  Disable All Notification Sounds
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Mute all notifications for messages, contracts, and documents.
                </p>
              </div>
              <Switch
                checked={settings.allNotificationSounds}
                onCheckedChange={(checked: boolean) =>
                  updateSetting("allNotificationSounds", checked)
                }
                className="shrink-0 data-[state=checked]:bg-[#4F46E5]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white px-8 py-2"
            disabled={isUpdating}
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      <Update
        open={isUpdateModalOpen}
        onOpenChange={setIsUpdateModalOpen}
        onCancel={() => setIsUpdateModalOpen(false)}
        onLogout={handleConfirmUpdate}
      />
    </>
  );
};

export default NotificationSettings;
