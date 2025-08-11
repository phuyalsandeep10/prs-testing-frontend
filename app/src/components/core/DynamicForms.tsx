"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

// Loading fallback component for forms
const FormLoadingFallback = () => (
  <Card className="p-6 min-h-96 flex items-center justify-center">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span>Loading form...</span>
    </div>
  </Card>
);

// Dynamic imports for form components
export const DynamicAddClientForm = dynamic(
  () => import("@/components/dashboard/org-admin/manage-clients/AddNewClientForm"),
  {
    loading: FormLoadingFallback,
    ssr: false,
  }
);

export const DynamicEditClientForm = dynamic(
  () => import("@/components/dashboard/org-admin/manage-clients/EditClientForm"),
  {
    loading: FormLoadingFallback,
    ssr: false,
  }
);

export const DynamicAddUserForm = dynamic(
  async () => {
    const mod = await import("@/components/dashboard/org-admin/manage-users/AddNewUserForm");
    return { default: (mod as any).AddNewUserForm || mod };
  },
  {
    loading: FormLoadingFallback,
    ssr: false,
  }
);

export const DynamicAddTeamForm = dynamic(
  async () => {
    const mod = await import("@/components/dashboard/org-admin/manage-teams/AddNewTeamForm");
    return { default: (mod as any).AddNewTeamForm || mod };
  },
  {
    loading: FormLoadingFallback,
    ssr: false,
  }
);

export const DynamicDealForm = dynamic(
  () => import("@/components/dashboard/salesperson/commission/DealForm"),
  {
    loading: FormLoadingFallback,
    ssr: false,
  }
);

export const DynamicPaymentVerificationForm = dynamic(
  () => import("@/components/dashboard/verifier/PaymentVerificationForm"),
  {
    loading: FormLoadingFallback,
    ssr: false,
  }
);