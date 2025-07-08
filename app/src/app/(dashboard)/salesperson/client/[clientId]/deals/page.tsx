"use client";

import * as React from "react";
import { ArrowLeft, Calendar, User, DollarSign, Briefcase, Clock, FileText, Building, Mail, Phone, Loader2, AlertTriangle } from "lucide-react";
import { useClient, useClientDeals } from "@/hooks/api";
import type { Client as ClientType, Deal } from "@/types/deals";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useParams } from "next/navigation";

const ClientDealsPage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();

  // Use standardized hooks
  const { 
    data: client, 
    isLoading: clientLoading, 
    error: clientError 
  } = useClient(clientId || '');
  
  const { 
    data: deals = [], 
    isLoading: dealsLoading, 
    error: dealsError 
  } = useClientDeals(clientId || '');

  const isLoading = clientLoading || dealsLoading;
  const hasError = clientError || dealsError;

  // Show error toast when there are errors
  React.useEffect(() => {
    if (clientError) {
      toast.error("Failed to fetch client details.");
    }
    if (dealsError) {
      toast.error("Failed to fetch deals.");
    }
  }, [clientError, dealsError]);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-500 mb-4" />
          <p className="text-gray-600">Loading client deals...</p>
        </div>
      </div>
    );
  }

  if (hasError || !client) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-500 mb-4" />
          <p className="text-red-600 mb-2">Could not load client information</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
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
                  <span className="font-semibold">{deal.deal_name || `Deal ${deal.id}`}</span>
                  <span className="text-gray-600">{deal.deal_date ? new Date(deal.deal_date).toLocaleDateString() : 'N/A'}</span>
                  <span className="font-semibold text-green-600">रू {(deal.deal_value || 0).toLocaleString()}</span>
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

const DealDetailView: React.FC<{ deal: Deal }> = ({ deal }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <DetailItem label="Deal ID" value={deal.id || deal.deal_id || ''} icon={<Briefcase />} />
          <DetailItem label="Deal Date" value={deal.deal_date ? new Date(deal.deal_date).toLocaleDateString() : 'N/A'} icon={<Calendar />} />
          <DetailItem label="Payment Status" value={deal.pay_status || deal.status || 'N/A'} icon={<FileText />} />
          <DetailItem label="Deal Value" value={`रू ${(deal.deal_value || deal.value || '0').toLocaleString()}`} icon={<DollarSign />} />
          <DetailItem label="Last Updated" value={deal.updated_at ? new Date(deal.updated_at).toLocaleDateString() : 'N/A'} icon={<Clock />} />
        </div>
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Activity</h2>
          <div className="space-y-4">
            {deal.activity_logs && deal.activity_logs.length > 0 ? (
              deal.activity_logs.map((log) => (
                <div key={log.id} className="p-4 bg-white rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-700">{new Date(log.timestamp).toLocaleString()}</p>
                  <p className="text-gray-600">{log.message}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No activity recorded for this deal.</p>
            )}
          </div>
        </div>
        {deal.payments && deal.payments.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Payments</h2>
            <div className="space-y-4">
              {deal.payments.map((payment) => (
                <div key={payment.id} className="p-4 bg-white rounded-lg border border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Amount</p>
                      <p className="text-lg font-semibold">रू {Number(payment.received_amount).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Method</p>
                      <p className="text-gray-800">{payment.payment_method}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'verified' ? 'bg-green-100 text-green-700' :
                        payment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Date</p>
                      <p className="text-gray-800">{new Date(payment.payment_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {payment.payment_remarks && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-sm font-medium text-gray-500">Remarks</p>
                      <p className="text-gray-800">{payment.payment_remarks}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
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