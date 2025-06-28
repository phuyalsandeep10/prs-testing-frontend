"use client";

import * as React from "react";
import { Search, LayoutGrid, List, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientTable } from "./ClientTable";
import { ClientKanbanView } from "./ClientKanbanView";
import { getClients, type Client } from "@/data/clients";

export function ManageClientsClient() {
  const [view, setView] = React.useState<"table" | "kanban">("table");
  const [searchTerm, setSearchTerm] = React.useState('');
  const clients = getClients();
  const [filteredClients, setFilteredClients] = React.useState<Client[]>(clients);

  // Global search function that searches across ALL client data fields
  const searchAllClientColumns = (client: Client, query: string): boolean => {
    const searchableFields = [
      client.name,
      client.email,
      client.id,
      client.category,
      client.salesperson,
      client.lastContact,
      client.expectedClose,
      client.value.toString(),
      client.status,
      client.satisfaction,
      client.remarks,
      client.primaryContactName,
      client.primaryContactPhone,
      client.address,
      client.activeDate,
      // Search in activities as well
      ...(client.activities?.map(activity => activity.description) || [])
    ];

    return searchableFields.some(field => 
      field.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Filter clients based on search query
  React.useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = clients.filter(client => 
        searchAllClientColumns(client, searchTerm)
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchTerm, clients]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Exact Figma Header Implementation */}
      <div className="bg-white px-8 py-8 border-b border-gray-100">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-semibold text-gray-900 mb-2">
              Client Management
            </h1>
            <p className="text-[16px] text-gray-500 leading-relaxed">
              Manage your user base, teams and access all the details of each user.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Search Input - RIGHT SIDE as per Figma */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-[320px] h-[44px] text-[14px] bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            {/* View Toggle Buttons */}
            <div className="flex items-center gap-2">
              <Button 
                variant={view === 'kanban' ? 'default' : 'outline'} 
                size="icon" 
                onClick={() => setView('kanban')}
                className={`w-[44px] h-[44px] rounded-lg transition-all ${
                  view === 'kanban' 
                    ? 'bg-[#4F46E5] hover:bg-[#4338CA] text-white' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <LayoutGrid className="h-5 w-5" />
              </Button>
              <Button 
                variant={view === 'table' ? 'default' : 'outline'} 
                size="icon" 
                onClick={() => setView('table')}
                className={`w-[44px] h-[44px] rounded-lg transition-all ${
                  view === 'table' 
                    ? 'bg-[#4F46E5] hover:bg-[#4338CA] text-white' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-8 py-6">
        {view === 'table' ? (
          <ClientTable clients={filteredClients} />
        ) : (
          <ClientKanbanView clients={filteredClients} />
        )}
      </div>
    </div>
  );
}
