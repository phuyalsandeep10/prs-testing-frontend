import React, { useState } from "react";
import { cn } from "@/lib/utils";
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
    <div className={cn("max-w-[736px]  h-auto space-y-6 pb-5 p-2 font-outfit")}>
      {/* Notifications Section */}
      <Card className={cn("border shadow-[-4px_4px_10px_rgba(0,0,0,0.1)] ")}>
        <CardHeader className={cn("pb-4 px-4")}>
          <CardTitle
            className={cn(
              "text-xl font-semibold text-gray-900 flex items-center gap-2"
            )}
          >
            Notifications
            <Settingnotification />
          </CardTitle>
          <p className={cn("text-md font-semibold text-[#A9A9A9]")}>
            Please fill the form below to update password.
          </p>
        </CardHeader>
        <CardContent className={cn("px-4 space-y-6")}>
          {/* Enable Desktop Notification */}
          <div className={cn("flex items-start justify-between gap-4")}>
            <div className={cn("flex-1")}>
              <Label className={cn("text-md font-semibold text-black")}>
                Enable Desktop Notification
              </Label>
              <p className={cn("text-sm text-[#7E7E7E] mt-1")}>
                Receive Notification of the messages, contracts, documents.
              </p>
            </div>
            <Switch
              checked={settings.desktopNotification}
              onCheckedChange={(checked) =>
                updateSetting("desktopNotification", checked)
              }
              className={cn("shrink-0 data-[state=checked]:bg-[#465FFF]")}
            />
          </div>

          {/* Enable Unread Notification Badge */}
          <div className={cn("flex items-start justify-between gap-4")}>
            <div className={cn("flex-1")}>
              <Label className={cn("text-md font-semibold text-black")}>
                Enable Unread Notification Badge
              </Label>
              <p className={cn("text-sm text-[#7E7E7E] mt-1")}>
                Shows a red badge on the app icon when you have unread messages.
              </p>
            </div>
            <Switch
              checked={settings.unreadNotificationBadge}
              onCheckedChange={(checked) =>
                updateSetting("unreadNotificationBadge", checked)
              }
              className={cn("shrink-0 data-[state=checked]:bg-[#465FFF]")}
            />
          </div>

          {/* Push Notification Time-Out */}
          <div className={cn("space-y-2")}>
            <Label className={cn("text-md font-semibold text-black")}>
              Push Notification Time-Out
            </Label>
            <select
              value={settings.pushNotificationTimeout}
              onChange={(e) =>
                updateSetting("pushNotificationTimeout", e.target.value)
              }
              className={cn(
                "h-12 w-full border border-gray-200 rounded px-3 text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              )}
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

      {/* Email Notifications Sec tion */}
      <Card className={cn("border shadow-[-4px_4px_10px_rgba(0,0,0,0.1)]")}>
        <CardHeader className={cn(" pb-4 px-4")}>
          <CardTitle
            className={cn(
              "text-xl font-semibold text-black flex items-center gap-2"
            )}
          >
            Email Notifications
            <Settingmessage />
          </CardTitle>
        </CardHeader>
        <CardContent className={cn("px-0 ")}>
          {/* Communication Emails */}
          <div className={cn("flex items-start justify-between gap-4 px-4")}>
            <div className={cn("flex-1")}>
              <Label className={cn("text-md font-semibold text-black")}>
                Communication Emails
              </Label>
              <p className={cn("text-sm text-[#7E7E7E] mt-[6px]")}>
                Receive email for messages, contract, documents.
              </p>
            </div>
            <Switch
              checked={settings.communicationEmails}
              onCheckedChange={(checked) =>
                updateSetting("communicationEmails", checked)
              }
              className={cn("shrink-0 data-[state=checked]:bg-[#465FFF]")}
            />
          </div>

          {/* Announcements & Updates */}
          <div
            className={cn(
              "flex items-start justify-between gap-4 pt-[12px] px-4"
            )}
          >
            <div className={cn("flex-1")}>
              <Label className={cn("text-md font-semibold text-black")}>
                Announcements & Updates
              </Label>
              <p className={cn("text-sm text-[#7E7E7E] mt-[6px]")}>
                Receive email for updates, improvements, news, etc.
              </p>
            </div>
            <Switch
              checked={settings.announcementsUpdates}
              onCheckedChange={(checked) =>
                updateSetting("announcementsUpdates", checked)
              }
              className={cn("shrink-0 data-[state=checked]:bg-[#465FFF]")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sounds Section */}
      <Card className={cn("border shadow-[-4px_4px_10px_rgba(0,0,0,0.1)]")}>
        <CardHeader className={cn("px-0")}>
          <CardTitle
            className={cn(
              "text-xl font-semibold text-black flex items-center gap-2 pl-4"
            )}
          >
            Sounds
            <Settingsound />
          </CardTitle>
        </CardHeader>
        <CardContent className={cn("px-0 pt-2")}>
          <div className={cn("flex items-start justify-between gap-4 px-4")}>
            <div className={cn("flex-1")}>
              <Label className={cn("text-md font-semibold text-black")}>
                Disable All Notification Sounds
              </Label>
              <p className={cn("text-sm text-[#7E7E7E] mt-[6px]")}>
                Mute all Notification of the messages, contracts, documents.
              </p>
            </div>
            <Switch
              checked={settings.allNotificationSounds}
              onCheckedChange={(checked) =>
                updateSetting("allNotificationSounds", checked)
              }
              className={cn("shrink-0 data-[state=checked]:bg-[#465FFF] ")}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
