"use client";
import { useState } from "react";
import SettingsSection, {
  Tab,
} from "@/components/dashboard/settings/settingSection";

const Page = () => {
  const [tab, setTab] = useState<Tab>("account");
  
  return (
    <div className="min-h-screen bg-gray-50 font-outfit">
      {/* Header Section */}
      <div className="bg-white px-8 py-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[28px] font-semibold text-black font-outfit">
              Settings
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="px-8 py-6">
        <SettingsSection selected={tab} onChange={setTab} />
      </div>
    </div>
  );
};

export default Page;
