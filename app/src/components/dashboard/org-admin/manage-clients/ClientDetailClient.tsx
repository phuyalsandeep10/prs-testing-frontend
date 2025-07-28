"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Client } from "@/lib/types/roles";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Helper function to format dates
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

// Helper function to get display name
const getDisplayName = (client: any) => {
  return client.client_name || client.name || "Unknown Client";
};

export function ClientDetailClient({ client }: { client: any }) {
  const displayName = getDisplayName(client);
  const clientEmail = client.email || "No email provided";
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section - Matching Figma exactly */}
      <div className="px-6 py-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[28px] font-semibold text-[#4F46E5]">{displayName}</h1>
          <Link href="/org-admin/manage-clients">
            <Button 
              variant="outline" 
              className="bg-gray-200 border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm"
            >
              ← Back to Dashboard
            </Button>
          </Link>
        </div>
        <p className="text-[14px] text-gray-500 pb-4">{clientEmail}</p>
        <hr className="border-gray-200" />
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Overview Section - Left Column */}
          <div>
            <h2 className="text-[18px] font-semibold text-gray-900 mb-6">Overview</h2>
            <div className="space-y-6">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-8">
                <InfoItem 
                  label="Client ID" 
                  value={`#PRS-${String(client.id).padStart(5, '0')}`} 
                />
                <InfoItem 
                  label="Current Status" 
                  value={client.status === 'clear' ? 'Loyal' : client.status === 'pending' ? 'Pending' : client.status === 'bad_debt' ? 'Bad Debt' : 'Loyal'} 
                />
              </div>
              
              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-8">
                <InfoItem 
                  label="Salesperson Associated" 
                  value={client.created_by?.full_name || client.created_by?.email || "Kushal Shrestha"} 
                />
                <InfoItem 
                  label="Total Transactional Value" 
                  value={client.deal_value ? `$${Number(client.deal_value).toLocaleString()}` : "$150,000"} 
                />
              </div>
              
              {/* Row 3 */}
              <div className="grid grid-cols-2 gap-8">
                <InfoItem 
                  label="Latest Deal Active Date" 
                  value={formatDate(client.created_at) || "May 28, 2025"} 
                />
                <InfoItem 
                  label="Closing Date" 
                  value={formatDate(client.due_date) || "Jun 15, 2025"} 
                />
              </div>
            </div>
          </div>
          
          {/* Contact Information - Right Column */}
          <div>
            <h2 className="text-[18px] font-semibold text-gray-900 mb-6">Contact Information</h2>
            <div className="space-y-6">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-8">
                <InfoItem 
                  label="Primary Contact" 
                  value={client.primary_contact || client.client_name || "Kushal Rai"} 
                />
                <InfoItem 
                  label="Contact" 
                  value={client.phone_number || "+977 9842367167"} 
                />
              </div>
              
              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-8">
                <InfoItem 
                  label="Email" 
                  value={clientEmail} 
                />
                <InfoItem 
                  label="Address" 
                  value={client.address || client.nationality || "Itahari, Sunsari, Nepal"} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-12">
          <h2 className="text-[18px] font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {client.activities && client.activities.length > 0 ? (
              client.activities.map((activity: any, index: number) => (
                <div key={index} className="flex">
                  <div className="w-1 bg-[#4F46E5] mr-4 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="text-[12px] text-gray-500 mb-1">
                      {formatDate(activity.timestamp) || "May 28,2025 - 10:30 AM"}
                    </div>
                    <div className="text-[14px] text-blue-600 underline cursor-pointer">
                      {activity.description || activity.message || "Meeting with Jane Smith to discuss CRM integration. Client Expressed strong interest in Module B."}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Default activities matching Figma
              [
                "Meeting with Jane Smith to discuss CRM integration. Client Expressed strong interest in Module B.",
                "Meeting with Jane Smith to discuss CRM integration. Client Expressed strong interest in Module B.",
                "Meeting with Jane Smith to discuss CRM integration. Client Expressed strong interest in Module B.",
                "Meeting with Jane Smith to discuss CRM integration. Client Expressed strong interest in Module B."
              ].map((activity, index) => (
                <div key={index} className="flex">
                  <div className="w-1 bg-[#4F46E5] mr-4 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="text-[12px] text-gray-500 mb-1">
                      May 28,2025 - 10:30 AM
                    </div>
                    <div className="text-[14px] text-blue-600 underline cursor-pointer">
                      {activity}
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
}

function InfoItem({ 
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
