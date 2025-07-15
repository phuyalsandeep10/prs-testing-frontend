"use client";

import * as React from "react";
import { ArrowLeft, Calendar, User, DollarSign, Briefcase, Clock, FileText, Building, Mail, Phone } from "lucide-react";
import { apiClient } from "@/lib/api";
import type { Client as ClientType } from "@/types/deals";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useParams } from "next/navigation";

type DealType = Record<string, any>;

const ClientDealsPage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = React.useState<ClientType | null>(null);
  const [deals, setDeals] = React.useState<DealType[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchClientAndDeals = async () => {
      if (!clientId) return;
      setIsLoading(true);
      try {
        const clientResponse = await apiClient.getClientById(clientId);
        if (clientResponse.success && clientResponse.data) {
          setClient(clientResponse.data);
        } else {
          toast.error("Failed to fetch client details.");
        }

        const dealsResponse = await apiClient.getDealsByClientId(clientId);
        if (dealsResponse.success && dealsResponse.data) {
          setDeals(dealsResponse.data);
        } else {
          toast.error("Failed to fetch deals.");
        }
      } catch (error: any) {
        toast.error(error.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchClientAndDeals();
  }, [clientId]);

  if (isLoading) {
    return <div className="p-8">Loading client deals...</div>;
  }

  if (!client) {
    return <div className="p-8">Could not load client information.</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Client Sales Details</h1>
        <Link href="/dashboard/salesperson/client" key="back-link">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Client List
          </Button>
        </Link>
      </div>
      
      {/* Client Information Header */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Building className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{client.client_name}</h2>
            <div className="flex items-center gap-4 text-gray-500 mt-1">
              <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> {(client as any).email}</span>
              <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> {(client as any).phone_number}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deals Accordion */}
      <Accordion type="single" collapsible className="w-full bg-white p-4 rounded-lg shadow-md">
        {deals.length > 0 ? (
          deals.map(deal => (
            <AccordionItem value={String(deal.id)} key={deal.id}>
              <AccordionTrigger>
                <div className="flex justify-between w-full pr-4">
                  <span className="font-semibold">{deal.id}</span>
                  <span className="text-gray-600">{new Date(deal.createdAt).toLocaleDateString()}</span>
                  <span className="font-semibold text-green-600">${deal.amount.toLocaleString()}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <DealDetailView deal={deal} />
              </AccordionContent>
            </AccordionItem>
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">This client has no deals.</p>
        )}
      </Accordion>
    </div>
  );
};

const DealDetailView: React.FC<{ deal: DealType }> = ({ deal }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <DetailItem label="Deal ID" value={deal.id} icon={<Briefcase />} />
          <DetailItem label="Expected Close Date" value={new Date(deal.expectedCloseDate).toLocaleDateString()} icon={<Calendar />} />
          <DetailItem label="Current Payment Stage" value={deal.status} icon={<FileText />} />
          <DetailItem label="Deal Value" value={`$${deal.amount.toLocaleString()}`} icon={<DollarSign />} />
          <DetailItem label="Last Updated" value={new Date(deal.updatedAt).toLocaleDateString()} icon={<Clock />} />
        </div>
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Activity</h2>
          <div className="space-y-4">
            {deal.timeline && deal.timeline.length > 0 ? (
              deal.timeline.map((event) => (
                <div key={event.id} className="p-4 bg-white rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-700">{event.timestamp}</p>
                  <p className="text-gray-600">{event.description}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No activity recorded for this deal.</p>
            )}
          </div>
        </div>
    </div>
  );
}

const DetailItem: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div>
    <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
      {React.cloneElement(icon as React.ReactElement, { className: 'h-4 w-4' })}
      {label}
    </p>
    <p className="text-lg font-semibold text-gray-800 mt-1">{value}</p>
  </div>
);

export default ClientDealsPage; 