"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Client } from "@/lib/types/roles";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function ClientDetailClient({ client }: { client: any }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean White Header - Matching Figma */}
      <div className="bg-white px-8 py-8 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-semibold text-gray-900 mb-2">{client.name}</h1>
            <p className="text-[16px] text-gray-500">{client.email}</p>
          </div>
          <Link href="/org-admin/manage-clients">
            <Button 
              variant="outline" 
              className="bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Overview Section - Left Side */}
          <Card className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="text-[20px] font-semibold text-gray-900">Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InfoItem label="Client ID" value={client.id} />
                <InfoItem label="Current Status" value={client.status === 'clear' ? 'Loyal' : client.status === 'pending' ? 'Pending' : 'Bad Depth'} />
                <InfoItem label="Salesperson (Referrer)" value={client.salesperson} />
                <InfoItem label="Transaction Value" value={`$${client.value.toLocaleString()}`} />
                <InfoItem label="Active Date" value={client.activeDate} />
                <InfoItem label="Expected Closing Date" value={client.expectedClose} />
              </div>
            </CardContent>
          </Card>
          
          {/* Contact Information - Right Side */}
          <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="text-[20px] font-semibold text-gray-900">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoItem label="Primary Contact" value={client.primaryContactName} />
              <InfoItem label="Contact" value={client.primaryContactPhone} />
              <InfoItem label="Email" value={client.email} />
              <InfoItem label="Address" value={client.address} />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <Card className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle className="text-[20px] font-semibold text-gray-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {client.activities.length > 0 ? (
                client.activities.map((activity, index) => (
                  <div key={index} className="flex">
                    {/* Blue Left Border */}
                    <div className="w-1 bg-blue-500 rounded-full mr-4 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="text-[14px] font-medium text-gray-900 mb-1">
                        {activity.timestamp}
                      </div>
                      <div className="text-[14px] text-gray-600 leading-relaxed">
                        {activity.description}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-[14px]">No recent activity.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[14px] text-gray-500">{label}</p>
      <p className="text-[14px] font-medium text-gray-900">{value}</p>
    </div>
  );
}
