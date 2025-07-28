"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Client Details Root Page
 * 
 * This page serves as the entry point for client details from the kanban view.
 * It automatically redirects to the deals sub-page which contains the main client details.
 * 
 * Route: /dashboard/salesperson/client/[clientId]
 * Redirects to: /dashboard/salesperson/client/[clientId]/deals
 */
export default function ClientDetailsPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const router = useRouter();

  useEffect(() => {
    if (clientId) {
      // Redirect to the deals page which contains the client details
      router.replace(`/salesperson/client/${clientId}/deals`);
    }
  }, [clientId, router]);

  // Show a loading state while redirecting
  return (
    <div className="p-8 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading client details...</p>
      </div>
    </div>
  );
}