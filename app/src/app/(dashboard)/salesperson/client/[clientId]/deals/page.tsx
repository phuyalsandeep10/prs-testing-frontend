"use client";

import * as React from "react";
import { useClient, useClientDeals } from "@/hooks/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";

const LABEL_CLASS = "text-gray-500 text-[16px] font-normal";
const VALUE_CLASS = "text-black text-[18px] font-semibold";

const SalesDetailsPage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { data: client, isLoading: clientLoading, error: clientError } = useClient(clientId || '');
  const { data: deals = [], isLoading: dealsLoading, error: dealsError } = useClientDeals(clientId || '');

  const isLoading = clientLoading || dealsLoading;
  const hasError = clientError || dealsError;

  // Pick the most recent deal (by deal_date or created_at)
  const mainDeal = React.useMemo(() => {
    if (!deals || deals.length === 0) return null;
    return [...deals].sort((a, b) => {
      const dateA = new Date(a.deal_date || a.created_at || 0).getTime();
      const dateB = new Date(b.deal_date || b.created_at || 0).getTime();
      return dateB - dateA;
    })[0];
  }, [deals]);

  // Gather all activity logs from all deals (flattened)
  const allActivities = React.useMemo(() => {
    if (!deals) return [];
    return deals.flatMap(deal => (deal.activity_logs || []).map(log => ({...log, dealName: deal.deal_name})));
  }, [deals]);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-500 mb-4" />
          <p className="text-gray-600">Loading sales details...</p>
        </div>
      </div>
    );
  }

  if (hasError || !client || !mainDeal) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-500 mb-4" />
          <p className="text-red-600 mb-2">Could not load sales details</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Helper for formatting dates
  const formatDate = (date: string | undefined) => {
    if (!date) return "-";
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return date;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Back button */}
      <div className="flex justify-end items-center p-8 pb-0">
        <Link href="/dashboard/salesperson/client">
          <Button variant="outline" className="font-semibold text-[16px] px-6 py-2 rounded-lg">
            &larr; Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Sales Details Section */}
      <div className="flex-1 flex flex-col items-center w-full">
        <div className="w-full max-w-5xl bg-white rounded-xl shadow-md mt-4 p-10">
          <h1 className="text-[32px] font-bold text-[#465FFF] mb-8">Sales Details</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6 mb-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <div className={LABEL_CLASS}>Client name</div>
                <div className={VALUE_CLASS}>{client.client_name || "-"}</div>
              </div>
              <div>
                <div className={LABEL_CLASS}>Current Payment Stage</div>
                <div className="text-green-600 text-[18px] font-semibold">
                  {typeof mainDeal.client_status === 'string' && mainDeal.client_status.toLowerCase() === 'clear' ? 'Clear' : mainDeal.client_status || '-'}
                </div>
              </div>
              <div>
                <div className={LABEL_CLASS}>Last contact Date</div>
                <div className={VALUE_CLASS}>{formatDate(mainDeal.updated_at)}</div>
              </div>
            </div>
            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <div className={LABEL_CLASS}>Deal Name</div>
                <div className={VALUE_CLASS}>{mainDeal.deal_name || '-'}</div>
              </div>
              <div>
                <div className={LABEL_CLASS}>Deal Value</div>
                <div className={VALUE_CLASS}>${Number(mainDeal.deal_value || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
              </div>
              <div>
                <div className={LABEL_CLASS}>Expected Close Date</div>
                <div className={VALUE_CLASS}>{formatDate(mainDeal.due_date)}</div>
              </div>
              <div>
                <div className={LABEL_CLASS}>Assigned Salesperson</div>
                <div className={VALUE_CLASS}>{
                  mainDeal.created_by?.full_name
                    || mainDeal.created_by?.email
                    || '-'
                }</div>
              </div>
              <div>
                <div className={LABEL_CLASS}>Next Sales Action</div>
                <div className="text-[#465FFF] text-[18px] font-semibold">Schedule Follow-up</div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="w-full max-w-5xl bg-white rounded-xl shadow-md mt-8 p-10">
          <h2 className="text-[22px] font-bold mb-6">Reviews</h2>
          <div className="space-y-4">
            {allActivities.length > 0 ? (
              allActivities.map((log, idx) => (
                <div key={log.id || idx} className="bg-[#F6F8FA] rounded-lg p-4 border border-[#E5E7EB]">
                  <div className="text-[15px] text-gray-500 mb-1">{formatDate(log.timestamp)}{log.dealName ? ` - ${log.dealName}` : ''}</div>
                  <div className="text-[16px] text-gray-800">{log.message}</div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-[16px]">No reviews or activity found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDetailsPage; 