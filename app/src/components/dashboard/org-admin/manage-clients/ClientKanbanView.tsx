"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { type Client, type ClientCategory } from "@/data/clients";
import Link from "next/link";

interface ClientKanbanViewProps {
  clients: Client[];
}

const categoryColors: Record<ClientCategory, string> = {
  "In consistent": "text-red-500",
  "Loyal": "text-green-500",
  "Occasional": "text-yellow-500",
};

export function ClientKanbanView({ clients }: ClientKanbanViewProps) {
  const clientsByCategory = clients.reduce((acc, client) => {
    if (!acc[client.category]) {
      acc[client.category] = [];
    }
    acc[client.category].push(client);
    return acc;
  }, {} as Record<ClientCategory, Client[]>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(clientsByCategory).map(([category, clients]) => (
        <div key={category}>
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <span className={`w-3 h-3 rounded-full mr-2 ${categoryColors[category as ClientCategory].replace('text-', 'bg-')}`}></span>
            {category}
          </h2>
          <div className="space-y-4">
            {clients.map((client) => (
              <KanbanCard key={client.id} client={client} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function KanbanCard({ client }: { client: Client }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg truncate">{client.name}</h3>
          <p className="text-sm text-muted-foreground truncate">{client.email}</p>
        </div>
        <Badge
          className={`text-xs flex-shrink-0 ${
            client.status === "Clear"
              ? "bg-green-100 text-green-700"
              : client.status === "Pending"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}
          variant={
            client.status === "Clear"
              ? "default"
              : client.status === "Pending"
              ? "outline"
              : "destructive"
          }
        >
          {client.status}
        </Badge>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2">
          <span>Salesperson (Referral)</span>
          <span className="text-right">Last Contact</span>
          <span className="font-semibold text-black truncate">{client.salesperson}</span>
          <span className="font-semibold text-black text-right truncate">{client.lastContact}</span>
          <span>Value</span>
          <span className="text-right">Expected Close</span>
          <span className="font-semibold text-black">${client.value.toLocaleString()}</span>
          <span className="font-semibold text-black text-right truncate">{client.expectedClose}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/org-admin/manage-clients/${client.id}`} className="w-full">
          <Button className="w-full">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
