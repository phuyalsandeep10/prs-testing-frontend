"use client";

import * as React from "react";
import { Search, LayoutGrid, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientTable } from "./ClientTable";
import { ClientKanbanView } from "./ClientKanbanView";
import { apiClient } from "@/lib/api/client";
import { type Client } from "@/lib/types/roles";
import { toast } from "sonner";

export function ManageClientsClient() {
  const [view, setView] = React.useState<"table" | "kanban">("table");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [clients, setClients] = React.useState<Client[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.getClients();
        if (response.success && Array.isArray(response.data)) {
          setClients(response.data);
        } else {
          toast.error(response.message || "Failed to fetch clients.");
          setClients([]);
        }
      } catch (error: any) {
        console.error("Failed to fetch clients:", error);
        toast.error(error.message || "An unexpected error occurred.");
        setClients([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filteredClients = React.useMemo(() => {
    if (!searchTerm) return clients;
    return clients.filter(client =>
      (client.client_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (client.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (client.phone_number?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-8 py-8 border-b border-gray-100">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-semibold text-gray-900 mb-2">
              Client Management
            </h1>
            <p className="text-[16px] text-gray-500 leading-relaxed">
              Manage your client base and view their details.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-[320px] h-[44px] text-[14px] bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={view === "kanban" ? "default" : "outline"}
                size="icon"
                onClick={() => setView("kanban")}
                className={`w-[44px] h-[44px] rounded-lg transition-all ${
                  view === "kanban"
                    ? "bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <LayoutGrid className="h-5 w-5" />
              </Button>
              <Button
                variant={view === "table" ? "default" : "outline"}
                size="icon"
                onClick={() => setView("table")}
                className={`w-[44px] h-[44px] rounded-lg transition-all ${
                  view === "table"
                    ? "bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
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
        {isLoading ? (
          <div className="text-center py-12">Loading clients...</div>
        ) : view === "table" ? (
          <ClientTable clients={filteredClients} />
        ) : (
          <ClientKanbanView clients={filteredClients} />
        )}
      </div>
    </div>
  );
}
