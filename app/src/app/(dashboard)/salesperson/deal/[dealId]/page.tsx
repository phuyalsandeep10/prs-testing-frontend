"use client";

import * as React from "react";
import { ArrowLeft, Calendar, User, DollarSign, Briefcase, Clock, FileText } from "lucide-react";
import { apiClient } from "@/lib/api";
// Detailed domain types are not strictly required for this view. Use a looser
// shape to avoid compile-time mismatches with backend responses.
import type { Client as ClientType } from "@/types/deals";
type DealType = Record<string, any>; // Fallback until backend contracts are stabilised
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { useParams } from "next/navigation";

const DealDetailPage: React.FC = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const [deal, setDeal] = React.useState<DealType | null>(null);
  const [client, setClient] = React.useState<ClientType | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDealDetails = async () => {
      if (!dealId) return;
      setIsLoading(true);
      try {
        const dealResponse = await apiClient.getDealById(dealId) as any;
        if (dealResponse.success && dealResponse.data) {
          setDeal(dealResponse.data);
          // Now fetch the client details
          const clientResponse = await apiClient.getClientById(dealResponse.data.clientId as string);
          if (clientResponse.success && clientResponse.data) {
            setClient(clientResponse.data);
          } else {
            toast.error("Failed to fetch client details.");
          }
        } else {
          toast.error(dealResponse.message || "Failed to fetch deal details.");
        }
      } catch (error: any) {
        toast.error(error.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDealDetails();
  }, [dealId]);

  if (isLoading) {
    return <div className="p-8">Loading deal details...</div>;
  }

  if (!deal || !client) {
    return <div className="p-8">Could not load deal information.</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Sales Details</h1>
        <Link href="/dashboard/salesperson">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <DetailItem label="Client Name" value={client.client_name} icon={<User />} />
          <DetailItem label="Deal ID" value={deal.id} icon={<Briefcase />} />
          <DetailItem label="Expected Close Date" value={new Date(deal.expectedCloseDate).toLocaleDateString()} icon={<Calendar />} />
          <DetailItem label="Current Payment Stage" value={deal.status} icon={<FileText />} />
          <DetailItem label="Deal Value" value={`$${deal.amount.toLocaleString()}`} icon={<DollarSign />} />
          <DetailItem label="Last Contact Date" value={new Date(deal.updatedAt).toLocaleDateString()} icon={<Clock />} />
          <DetailItem label="Next Sales Action" value="Schedule Follow-up" icon={<ArrowLeft />} />
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Reviews</h2>
          <div className="space-y-4">
            {deal.timeline && deal.timeline.length > 0 ? (
              deal.timeline.map((event) => (
                <div key={event.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-700">{event.timestamp}</p>
                  <p className="text-gray-600">{event.description}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No reviews or activity recorded for this deal.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div>
    <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
      {React.cloneElement(icon as React.ReactElement, { className: 'h-4 w-4' })}
      {label}
    </p>
    <p className="text-lg font-semibold text-gray-800 mt-1">{value}</p>
  </div>
);

export default DealDetailPage; 