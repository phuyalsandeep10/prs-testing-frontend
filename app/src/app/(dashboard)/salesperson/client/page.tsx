"use client";

import React, { useState, useMemo, useCallback, memo } from 'react';
import { Eye, Edit, Trash2, Plus, Search, Filter, LayoutGrid, List } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { UnifiedTable } from "@/components/core";
import { getClients } from '@/data/clients';
import type { Client } from '@/types';
import { ClientKanbanView } from './ClientKanbanView';
import { ClientDetailCard } from './ClientDetailCard';
import AddNewClientForm from './AddNewClientForm';
import EditClientForm from './EditClientForm';
import { useDebouncedSearch } from '@/hooks/useDebounce';
import { createPortal } from 'react-dom';

// Memoized status color function
const getStatusColor = (status: string) => {
  switch (status) {
    case 'clear': 
      return 'bg-[#E6F7FF] text-[#16A34A] px-3 py-1 text-[12px] font-medium rounded-full';
    case 'pending': 
      return 'bg-[#FFF7ED] text-[#EA580C] px-3 py-1 text-[12px] font-medium rounded-full';
    case 'bad-depth': 
      return 'bg-[#FEF2F2] text-[#DC2626] px-3 py-1 text-[12px] font-medium rounded-full';
    default: 
      return 'bg-gray-100 text-gray-600 px-3 py-1 text-[12px] font-medium rounded-full';
  }
};

// Memoized satisfaction color function
const getSatisfactionColor = (satisfaction: string) => {
  switch (satisfaction) {
    case 'positive': 
      return 'bg-[#E6F7FF] text-[#16A34A] px-3 py-1 text-[12px] font-medium rounded-full';
    case 'neutral': 
      return 'bg-[#FFF7ED] text-[#EA580C] px-3 py-1 text-[12px] font-medium rounded-full';
    case 'negative': 
      return 'bg-[#FEF2F2] text-[#DC2626] px-3 py-1 text-[12px] font-medium rounded-full';
    default: 
      return 'bg-gray-100 text-gray-600 px-3 py-1 text-[12px] font-medium rounded-full';
  }
};

const ClientsPage = React.memo(() => {
  const [view, setView] = useState<"table" | "kanban">("table");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Use debounced search hook for better performance
  const { searchValue, debouncedSearchValue, setSearchValue } = useDebouncedSearch('', 300);

  // Memoize clients data
  const clients = useMemo(() => getClients(), []);

  // Memoized search function
  const searchAllClientColumns = useCallback((client: Client, query: string): boolean => {
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
  }, []);

  // Memoized filtered clients
  const filteredClients = useMemo(() => {
    if (debouncedSearchValue.trim()) {
      return clients.filter(client => 
        searchAllClientColumns(client, debouncedSearchValue)
      );
    }
    return clients;
  }, [debouncedSearchValue, clients, searchAllClientColumns]);

  // Memoized event handlers
  const handleEdit = useCallback((client: Client) => {
    setSelectedClient(client);
    setShowEditModal(true);
  }, []);

  const handleDelete = useCallback((clientId: string) => {
    console.log('Delete client:', clientId);
  }, []);

  const handleView = useCallback((client: Client) => {
    setSelectedClient(client);
    setShowViewModal(true);
  }, []);

  // Memoized columns definition
  const columns = useMemo(() => [
    {
      accessorKey: "name",
      header: "Client Name",
      cell: ({ row }: any) => (
        <div className="text-[14px] font-medium text-gray-900">
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: "activeDate",
      header: "Active Date",
      cell: ({ row }: any) => (
        <div className="text-[14px] text-gray-700">
          {new Date(row.getValue("activeDate")).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.getValue("status") as string;
        return (
          <span className={getStatusColor(status)}>
            {status === 'clear' ? 'Clear' : 
             status === 'pending' ? 'Pending' : 
             'Bad Depth'}
          </span>
        );
      },
    },
    {
      accessorKey: "satisfaction",
      header: "Satisfaction",
      cell: ({ row }: any) => {
        const satisfaction = row.getValue("satisfaction") as string;
        return (
          <span className={getSatisfactionColor(satisfaction)}>
            {satisfaction.charAt(0).toUpperCase() + satisfaction.slice(1)}
          </span>
        );
      },
    },
    {
      id: "projects",
      header: "Projects",
      cell: () => (
        <div className="text-[14px] text-gray-700 font-medium">
          {Math.floor(Math.random() * 5) + 1}
        </div>
      ),
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      cell: ({ row }: any) => (
        <div className="text-[14px] text-gray-700 truncate max-w-[200px]">
          {row.getValue("remarks")}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        const client = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleView(client)}
              className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center hover:bg-[#4338CA] transition-colors"
              title="View"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleEdit(client)}
              className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center hover:bg-[#4338CA] transition-colors"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(client.id)}
              className="w-8 h-8 rounded-full bg-[#EF4444] text-white flex items-center justify-center hover:bg-[#DC2626] transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ] as any, [handleView, handleEdit, handleDelete]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Exact Figma Header Implementation */}
      <div className="bg-white px-8 py-8 border-b border-gray-100">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-semibold text-gray-900 mb-2">
              Your Clients
            </h1>
            <p className="text-[16px] text-gray-500 leading-relaxed">
              Manage your client base and access all the details of each client.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Search Input - LEFT of buttons */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search clients..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-12 pr-4 py-3 w-[320px] h-[44px] text-[14px] bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            
            {/* Filter Button */}
            <Button 
              variant="outline"
              className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-3 h-[44px] rounded-lg font-medium text-[14px] flex items-center gap-2 transition-all"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>

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

            {/* Add Client Button - RIGHT SIDE */}
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 py-3 h-[44px] rounded-lg font-medium text-[14px] flex items-center gap-2 transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-8 py-6">
        {view === 'table' ? (
          <UnifiedTable
            data={filteredClients}
            columns={columns}
            config={{
              features: {
                pagination: true,
                sorting: true,
                filtering: false, // Disable built-in filtering
                globalSearch: false, // Disable built-in search
                columnVisibility: false, // Disable column visibility button
              },
              styling: {
                variant: 'figma', // Use figma variant for consistent styling
                size: 'md',
                striped: false,
                bordered: true,
                hover: true,
              },
              pagination: {
                pageSize: 10,
                showSizeSelector: true,
                showInfo: true,
              },
              messages: {
                loading: 'Loading clients...',
                empty: 'No clients found',
                error: 'Failed to load clients',
              },
            }}
          />
        ) : (
          <ClientKanbanView 
            clients={filteredClients} 
            onViewDetails={handleView}
          />
        )}
      </div>

      {/* Add Client Modal - Portal Rendered */}
      {showAddModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}>
          <AddNewClientForm
            onClose={() => setShowAddModal(false)}
            onFormSubmit={() => setShowAddModal(false)}
          />
        </div>,
        document.body
      )}

      {/* Edit Client Modal - Portal Rendered */}
      {showEditModal && selectedClient && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}>
          <EditClientForm
            client={selectedClient}
            onClose={() => setShowEditModal(false)}
            onFormSubmit={() => setShowEditModal(false)}
          />
        </div>,
        document.body
      )}

      {/* View Client Modal - Portal Rendered */}
      {showViewModal && selectedClient && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999 }}>
          <ClientDetailCard
            client={selectedClient}
            onClose={() => setShowViewModal(false)}
          />
        </div>,
        document.body
      )}
    </div>
  );
});

export default ClientsPage;