"use client";
import { useState } from "react";
import SettingsSection, {
  Tab,
} from "@/components/dashboard/settings/settingSection";
import { useAuth } from "@/stores";

const Page = () => {
  const [tab, setTab] = useState<Tab>("account");
  const { isAuthInitialized } = useAuth();

  // Show loading until auth is fully initialized
  if (!isAuthInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 font-outfit flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
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
