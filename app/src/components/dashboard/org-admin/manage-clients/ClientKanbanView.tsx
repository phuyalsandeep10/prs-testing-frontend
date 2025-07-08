"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { type Client } from "@/lib/types/roles";
import Link from "next/link";

interface ClientKanbanViewProps {
  clients: Client[];
}

const statusConfig = {
  "clear": {
    label: "Clear",
    color: "text-green-600",
    bgColor: "bg-green-500",
    cardBorder: "border-green-200",
  },
  "pending": {
    label: "Pending", 
    color: "text-orange-600",
    bgColor: "bg-orange-500",
    cardBorder: "border-orange-200",
  },
  "bad_debt": {
    label: "Bad Debt",
    color: "text-red-600", 
    bgColor: "bg-red-500",
    cardBorder: "border-red-200",
  },
} as const;

export function ClientKanbanView({ clients }: ClientKanbanViewProps) {
  // Group clients by status
  const clientsByStatus = clients.reduce((acc, client) => {
    const status = client.payment_status || "pending"; // Default to pending if status is null
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(client);
    return acc;
  }, {} as Record<"clear" | "pending" | "bad_debt", Client[]>);

  // Ensure all statuses are represented even if empty
  const statuses: ("clear" | "pending" | "bad_debt")[] = ["clear", "pending", "bad_debt"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statuses.map((status) => {
        const config = statusConfig[status];
        const statusClients = clientsByStatus[status] || [];
        
        return (
          <div key={status} className="space-y-4">
            {/* Status Header with colored dot */}
            <h2 className="text-[18px] font-semibold flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${config.bgColor}`}></span>
              <span className={config.color}>{config.label}</span>
            </h2>
            
            {/* Client Cards */}
            <div className="space-y-4">
              {statusClients.map((client) => (
                <KanbanCard key={client.id} client={client} />
              ))}
              {statusClients.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-[14px]">
                  No clients in this status
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({ client }: { client: Client }) {
  return (
    <Card className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <h3 className="text-[18px] font-semibold text-gray-900 mb-1">{client.client_name}</h3>
      </CardHeader>
      
      <CardContent className="pt-0 pb-4">
        <div className="space-y-3">
          {/* Email Row */}
          <div className="flex justify-between items-center">
            <span className="text-[14px] text-gray-500">Email</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[14px] font-medium text-gray-900">{client.email}</span>
          </div>
          
          {/* Phone Number Row */}
          <div className="flex justify-between items-center">
            <span className="text-[14px] text-gray-500">Phone</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[14px] font-medium text-gray-900">{client.phone_number}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Link href={`/org-admin/manage-clients/${client.id}`} className="w-full">
          <Button className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-medium text-[14px] h-10 rounded-lg transition-colors">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
