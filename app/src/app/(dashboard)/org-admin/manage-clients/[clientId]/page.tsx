import { getClientById } from "@/data/clients";
import { ClientDetailClient } from "../../../../../components/dashboard/org-admin/manage-clients/ClientDetailClient";
import { notFound } from "next/navigation";

interface ClientDetailPageProps {
  params: {
    clientId: string;
  };
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  const client = getClientById(params.clientId);

  if (!client) {
    notFound();
  }

  return <ClientDetailClient client={client} />;
}
