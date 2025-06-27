import React from "react";
import Providers from "@/app/providers";

export default function VerifierLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}

