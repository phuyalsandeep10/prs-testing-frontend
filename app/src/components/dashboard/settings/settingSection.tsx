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
    description: "Details about your personal Information",
  },
  {
    label: "Password & Security",
    key: "password",
    description: "Details about your personal Information",
  },
  {
    label: "Notifications",
    key: "notifications",
    description: "Details about your personal Information",
  },
  {
    label: "Sessions",
    key: "sessions",
    description: "Details about your personal Information",
  },
];

export default function SettingsSection({ selected, onChange }: SidebarProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-white pt-0 pl-0 font-outfit">
      {/* Sidebar Menu */}
      <div className="space-y-6 w-[324px] pr-6">
        {menuItems.map((item) => (
          <div
            key={item.key}
            className={`cursor-pointer px-3 py-2 rounded transition ${
              selected === item.key
                ? "border-1 border-blue-600"
                : "hover:bg-gray-100"
            }`}
            onClick={() => onChange(item.key)}
          >
            <p
              className={`text-[18px] font-bold ${
                selected === item.key ? "text-black" : "text-black"
              }`}
            >
              {item.label}
            </p>
            <p className="text-sm text-gray-500">{item.description}</p>
          </div>
        ))}
      </div>

      {/* Content Area */}
      <div className="col-span-2 space-y-6  overflow-y-auto">
        {selected === "account" && (
          <>
            <AccountForm />
          </>
        )}

        {selected === "password" && (
          <>
            <PasswordUpdateForm />
          </>
        )}

        {selected === "notifications" && (
          <>
            <NotificationSettings />
          </>
        )}

        {selected === "sessions" && (
          <>
            <Sessions />
          </>
        )}
      </div>
    </div>
  );
}
