"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

// Loading fallback component
const TableLoadingFallback = () => (
  <Card className="p-6 h-96 flex items-center justify-center">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span>Loading table...</span>
    </div>
  </Card>
);

// Dynamic imports for table components
export const DynamicDealsTable = dynamic(
  () => import("@/components/dashboard/salesperson/deals/DealsTable"),
  {
    loading: TableLoadingFallback,
    ssr: false,
  }
);

// For components without default exports, create wrapper exports
export const DynamicClientsTable = dynamic(
  async () => {
    const mod = await import("@/components/dashboard/org-admin/manage-clients/ClientTable");
    return { default: (mod as any).ClientTable || mod };
  },
  {
    loading: TableLoadingFallback,
    ssr: false,
  }
);

export const DynamicUsersTable = dynamic(
  async () => {
    const mod = await import("@/components/dashboard/org-admin/manage-users/UserTable");
    return { default: (mod as any).UserTable || mod };
  },
  {
    loading: TableLoadingFallback,
    ssr: false,
  }
);

export const DynamicTeamsTable = dynamic(
  async () => {
    const mod = await import("@/components/dashboard/org-admin/manage-teams/TeamsTable");
    return { default: (mod as any).TeamsTable || mod };
  },
  {
    loading: TableLoadingFallback,
    ssr: false,
  }
);

export const DynamicVerifierDealsTable = dynamic(
  () => import("@/components/dashboard/verifier/deals/DealsTable"),
  {
    loading: TableLoadingFallback,
    ssr: false,
  }
);