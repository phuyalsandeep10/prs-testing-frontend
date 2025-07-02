"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { type Client } from "@/lib/types/roles";
import { ClientDetailClient } from "../../../../../components/dashboard/org-admin/manage-clients/ClientDetailClient";
import { toast } from "sonner";

export default function ClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>();

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;

    const fetchClient = async () => {
      setLoading(true);
      try {
        const response = await apiClient.getClientById(clientId);
        if (response.success && response.data) {
          setClient(response.data);
        } else {
          toast.error("Failed to fetch client data.");
          setClient(null);
        }
      } catch (error) {
        console.error("Error fetching client:", error);
        toast.error("An error occurred while fetching client details.");
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!client) {
    // This will trigger the notFound() behavior in a client component context
    // You can also render a custom "Not Found" component here
    notFound();
    return null; // notFound() throws an error, so this is unreachable but good practice
  }

  return <ClientDetailClient client={client} />;
}
