import { getClientById } from "@/data/clients";
import { ClientDetailClient } from "../../../../../components/dashboard/org-admin/manage-clients/ClientDetailClient";
import { notFound } from "next/navigation";

interface ClientDetailPageProps {
  params: Promise<{
    clientId: string;
  }>;
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { clientId } = await params;
  const client = getClientById(clientId);

  if (!client) {
    notFound();
  }

  return <ClientDetailClient client={client} />;
}
