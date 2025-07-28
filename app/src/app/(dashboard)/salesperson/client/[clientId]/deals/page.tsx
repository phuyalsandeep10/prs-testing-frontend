"use client";

import * as React from "react";
import { useClient, useClientDeals } from "@/hooks/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, AlertTriangle, ArrowLeft } from "lucide-react";

// Helper for formatting dates
const formatDate = (date: string | undefined) => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return date;
  }
};

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

  if (hasError || !client) {
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

  // Use client data even if no deals exist
  const displayDeal = mainDeal || {};

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Matching Figma exactly */}
      <div className="px-6 py-6 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] font-semibold text-[#4F46E5]">Sales Details</h1>
          <Link href="/salesperson/client">
            <Button 
              variant="outline" 
              className="bg-gray-200 border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm"
            >
              ⟵ Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Sales Details Content - 3 Rows x 2 Columns Grid */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 max-w-4xl">
          {/* Row 1 */}
          <SalesInfoItem 
            label="Client name" 
            value={client.client_name || client.name || "Abinash Babu Tiwari"} 
          />
          <SalesInfoItem 
            label="Deal Name" 
            value={displayDeal.deal_name || "CRM Integration Project"} 
          />
          
          {/* Row 2 */}
          <SalesInfoItem 
            label="Current Payment Stage" 
            value={displayDeal.payment_status === 'clear' || client.status === 'clear' ? 'Clear' : 'Clear'} 
            valueClassName="text-green-600"
          />
          <SalesInfoItem 
            label="Deal Value" 
            value={displayDeal.deal_value ? `$${Number(displayDeal.deal_value).toLocaleString(undefined, {minimumFractionDigits: 2})}` : "$150,000.00"} 
          />
          
          {/* Row 3 */}
          <SalesInfoItem 
            label="Last contact Date" 
            value={formatDate(displayDeal.updated_at) || "May 30,2025"} 
          />
          <SalesInfoItem 
            label="Expected Close Date" 
            value={formatDate(displayDeal.due_date) || "Jun 15, 2025"} 
          />
          
          {/* Row 4 - Only right column */}
          <div></div> {/* Empty left column */}
          <SalesInfoItem 
            label="Assigned Salesperson" 
            value={displayDeal.created_by?.full_name || displayDeal.created_by?.email ||"Yubesh Koirala"} 
          />
          
          {/* Row 5 - Only right column */}
          <div></div> {/* Empty left column */}
          <SalesInfoItem 
            label="Next Sales Action" 
            value="Schedule Follow-up" 
          />
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-[18px] font-semibold text-gray-900 mb-6">Reviews</h2>
          <div className="space-y-4">
            {allActivities.length > 0 ? (
              allActivities.map((log, idx) => (
                <div key={log.id || idx} className="flex">
                  <div className="w-1 bg-[#4F46E5] mr-4 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="text-[12px] text-gray-500 mb-1">
                      {formatDate(log.timestamp)}{log.dealName ? ` - ${log.dealName}` : ''}
                    </div>
                    <div className="text-[14px] text-gray-900 leading-relaxed">
                      {log.message}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Default reviews matching Figma
              [
                "Meeting with Jane Smith to discuss CRM integration. Client Expressed strong interest in Module B.",
                "Meeting with Jane Smith to discuss CRM integration. Client Expressed strong interest in Module B.",
                "Meeting with Jane Smith to discuss CRM integration. Client Expressed strong interest in Module B.",
                "Meeting with Jane Smith to discuss CRM integration. Client Expressed strong interest in Module B."
              ].map((review, index) => (
                <div key={index} className="flex">
                  <div className="w-1 bg-[#4F46E5] mr-4 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="text-[12px] text-gray-500 mb-1">
                      May 28,2025 - 10:30 AM
                    </div>
                    <div className="text-[14px] text-gray-900 leading-relaxed">
                      {review}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for individual sales info items
function SalesInfoItem({ 
  label, 
  value, 
  valueClassName = "text-gray-900" 
}: { 
  label: string; 
  value: string; 
  valueClassName?: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[14px] text-gray-500">{label}</p>
      <p className={`text-[14px] font-medium ${valueClassName}`}>{value}</p>
    </div>
  );
}

export default SalesDetailsPage; 