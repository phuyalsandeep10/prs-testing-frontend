"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Client } from "@/data/clients";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ClientDetailClientProps {
  client: Client;
}

export function ClientDetailClient({ client }: ClientDetailClientProps) {
  return (
    <div className="p-6 sm:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
          <p className="text-muted-foreground">{client.email}</p>
        </div>
        <Link href="/org-admin/manage-clients">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InfoItem label="Client ID" value={client.id} />
              <InfoItem label="Current Status" value={client.category} />
              <InfoItem label="Salesperson (Referrer)" value={client.salesperson} />
              <InfoItem label="Transaction Value" value={`$${client.value.toLocaleString()}`} />
              <InfoItem label="Active Date" value={client.activeDate} />
              <InfoItem label="Expected Closing Date" value={client.expectedClose} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoItem label="Primary Contact" value={client.primaryContactName} />
            <InfoItem label="Contact" value={client.primaryContactPhone} />
            <InfoItem label="Email" value={client.email} />
            <InfoItem label="Address" value={client.address} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {client.activities.length > 0 ? (
              client.activities.map((activity, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gray-50/50">
                  <p className="font-medium text-sm text-gray-800">{activity.timestamp}</p>
                  <p className="text-muted-foreground text-sm">{activity.description}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">No recent activity.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
