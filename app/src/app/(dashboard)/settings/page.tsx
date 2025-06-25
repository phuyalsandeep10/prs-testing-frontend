"use client";
import { useState } from "react";
import SettingsSection, {
  Tab,
} from "@/components/dashboard/settings/settingSection";

const Page = () => {
  const [tab, setTab] = useState<Tab>("account");
  return (
    <div>
      <SettingsSection selected={tab} onChange={setTab} />
    </div>
  );
};

export default Page;
