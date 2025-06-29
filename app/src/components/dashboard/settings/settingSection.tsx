"use client";

import AccountForm from "./AccountForm";
import NotificationSettings from "./NotificationSetting";
import PasswordUpdateForm from "./PasswordUpdate";
import Sessions from "./Session";
export type Tab = "account" | "password" | "notifications" | "sessions";

type SidebarProps = {
  selected: Tab;
  onChange: (tab: Tab) => void;
};

const menuItems: { label: string; key: Tab; description: string }[] = [
  {
    label: "Account Settings",
    key: "account",
    description: "Manage your personal information and profile details",
  },
  {
    label: "Password & Security",
    key: "password",
    description: "Update your password and security settings",
  },
  {
    label: "Notifications",
    key: "notifications",
    description: "Configure your notification preferences",
  },
  {
    label: "Sessions",
    key: "sessions",
    description: "Manage your active sessions and devices",
  },
];

export default function SettingsSection({ selected, onChange }: SidebarProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6 font-outfit">
      {/* Sidebar Menu */}
      <div className="space-y-3">
        {menuItems.map((item) => (
          <div
            key={item.key}
            className={`cursor-pointer p-4 rounded-lg transition-all ${
              selected === item.key
                ? "bg-blue-50 border border-blue-200 shadow-sm"
                : "hover:bg-gray-50 border border-transparent"
            }`}
            onClick={() => onChange(item.key)}
          >
            <p
              className={`text-[16px] font-semibold ${
                selected === item.key ? "text-[#4F46E5]" : "text-gray-900"
              }`}
            >
              {item.label}
            </p>
            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="col-span-3 overflow-y-auto">
        {selected === "account" && <AccountForm />}
        {selected === "password" && <PasswordUpdateForm />}
        {selected === "notifications" && <NotificationSettings />}
        {selected === "sessions" && <Sessions />}
      </div>
    </div>
  );
}
