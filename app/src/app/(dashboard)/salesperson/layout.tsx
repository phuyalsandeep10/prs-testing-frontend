"use client";

import React from "react";
import Providers from "@/app/providers";

export default function SalespersonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
