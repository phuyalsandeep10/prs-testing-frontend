import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [settings, setSettings] = useState<NotificationState>({
    desktopNotification: true,
    unreadNotificationBadge: false,
    pushNotificationTimeout: "select",
    communicationEmails: true,
    announcementsUpdates: false,
    allNotificationSounds: true,
  });

  const updateSetting = (
    key: keyof NotificationState,
    value: boolean | string
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-6 font-outfit">
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
    </div>
  );
};

export default NotificationSettings;
