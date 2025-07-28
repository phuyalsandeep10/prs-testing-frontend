"use client";

import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, Filter, LayoutGrid, List, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { UnifiedTable } from '@/components/core/UnifiedTable';
import { PermissionGate } from '@/components/common/PermissionGate';
import { useClientsQuery, useDeleteClientMutation, useUpdateClientMutation } from '@/hooks/useIntegratedQuery';
import { useTableStateSync } from '@/hooks/useIntegratedQuery';
import { useUI } from '@/stores';
import { exportToCSV } from '@/lib/utils/export';
import { ClientKanbanView } from './ClientKanbanView';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import { useAuth } from '@/stores';
import type { Client } from '@/lib/types/roles';

export function ManageClientsClient() {
  const { addNotification } = useUI();
  const { user } = useAuth();
  const [view, setView] = useState<'table' | 'kanban'>('table');
  
  // Table state management
  const { tableState, setSearch, setPage, setPageSize, setFilters, resetFilters } = useTableStateSync('manage-clients');
  const queryParams = useMemo(() => ({
    page: tableState.page || 1,
    limit: tableState.pageSize || 10,
    search: tableState.search,
    ...(tableState.filters && Object.keys(tableState.filters).length > 0 && {
      ...tableState.filters
    }),
  }), [tableState]);

  // React Query for server state
  const {
    data: clientsData,
    isLoading,
    error,
    refetch
  } = useClientsQuery(user?.organizationId, queryParams);

  // Extract clients from response
  const clients = clientsData?.data || [];

  // Search and filter functionality
  const filteredClients = useMemo(() => {
    if (!clients) return [];
    
    return clients.filter((client: any) => {
      const searchTerm = tableState.search.toLowerCase();
      return (
        client.client_name?.toLowerCase().includes(searchTerm) ||
        client.email?.toLowerCase().includes(searchTerm) ||
        client.phone_number?.toLowerCase().includes(searchTerm) ||
        client.status?.toLowerCase().includes(searchTerm)
      );
    });
  }, [clients, tableState.search]);

  // Event handlers
  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleCreateClient = () => {
    toast.info('Add New Client', { description: 'Client creation modal coming soon.' });
  };

  const handleEditClient = (client: Client) => {
    toast.info('Edit Client', { description: 'Client edit modal coming soon.' });
  };

  const deleteClientMutation = useDeleteClientMutation();

  const handleDeleteClient = async (client: Client) => {
    try {
      await deleteClientMutation.mutateAsync(client.id);
      // Success notification is handled by the mutation
      refetch();
    } catch (error: any) {
      // Error notification is handled by the mutation
      console.error('Delete failed:', error);
    }
  };

  // Utility badge colors
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 px-3 py-1 text-[12px] font-medium rounded-full';
      case 'inactive':
        return 'bg-gray-100 text-gray-600 px-3 py-1 text-[12px] font-medium rounded-full';
      case 'prospect':
        return 'bg-yellow-100 text-yellow-700 px-3 py-1 text-[12px] font-medium rounded-full';
      case 'clear':
        return 'bg-green-100 text-green-700 px-3 py-1 text-[12px] font-medium rounded-full';
      case 'pending':
        return 'bg-orange-100 text-orange-700 px-3 py-1 text-[12px] font-medium rounded-full';
      case 'bad-debt':
      case 'bad_debt':
        return 'bg-red-100 text-red-700 px-3 py-1 text-[12px] font-medium rounded-full';
      default:
        return 'bg-gray-100 text-gray-600 px-3 py-1 text-[12px] font-medium rounded-full';
    }
  };

  const getSatisfactionColor = (satisfaction: string | null) => {
    switch (satisfaction) {
      case 'excellent':
        return 'bg-green-100 text-green-700 px-3 py-1 text-[12px] font-medium rounded-full';
      case 'good':
        return 'bg-blue-100 text-blue-700 px-3 py-1 text-[12px] font-medium rounded-full';
      case 'average':
        return 'bg-yellow-100 text-yellow-700 px-3 py-1 text-[12px] font-medium rounded-full';
      case 'poor':
        return 'bg-red-100 text-red-700 px-3 py-1 text-[12px] font-medium rounded-full';
      default:
        return 'bg-gray-100 text-gray-600 px-3 py-1 text-[12px] font-medium rounded-full';
    }
  };

  // Table columns
  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: 'client_name',
      header: 'Client Name',
      cell: ({ row }) => <span className="text-[14px] font-medium text-gray-900">{row.original.client_name}</span>,
    },
    {
      accessorKey: 'created_at',
      header: 'Active Date',
      cell: ({ row }) => (
        <span className="text-[14px] text-gray-700">
          {new Date(row.original.created_at).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={getStatusColor(row.original.status)}>
          {row.original.status ? row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1) : 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'created_by_name',
      header: 'Sales Lead',
      cell: ({ row }) => <span className="text-[14px] text-gray-700">{row.original.created_by_name || 'N/A'}</span>,
    },
    {
      accessorKey: 'satisfaction',
      header: 'Satisfaction',
      cell: ({ row }) => (
        <span className={getSatisfactionColor(row.original.satisfaction)}>
          {row.original.satisfaction ? row.original.satisfaction.charAt(0).toUpperCase() + row.original.satisfaction.slice(1) : 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'phone_number',
      header: 'Phone Number',
      cell: ({ row }) => (
        <div className="text-[14px] text-gray-700 font-medium">
          {row.original.phone_number ?? '—'}
        </div>
      ),
    },
    {
      accessorKey: 'remarks',
      header: 'Remarks',
      cell: ({ row }) => (
        <div className="text-[14px] text-gray-700 truncate max-w-[200px]">
          {row.original.remarks ?? '—'}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const client = row.original;
        return (
          <ErrorBoundary fallback={<div className="text-red-600">You do not have permission to perform this action.</div>}>
            <PermissionGate requiredPermissions={['manage:clients']}>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handleEditClient(client)}
                  className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center hover:bg-[#4338CA] transition-colors"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="w-8 h-8 rounded-full bg-[#EF4444] text-white flex items-center justify-center hover:bg-[#DC2626] transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the client
                        "{client.client_name}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteClient(client)}>
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </PermissionGate>
          </ErrorBoundary>
        );
      }
    }
  ];

  const handleExport = () => {
    exportToCSV('clients.csv', clients as any);
  };

  const handleRefreshClick = () => {
    void refetch();
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading clients: {error.message}</p>
          <Button onClick={() => { void refetch(); }}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-8 py-8 border-b border-gray-100">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-semibold text-gray-900 mb-2">
              Manage Clients
            </h1>
            <p className="text-[16px] text-gray-500 leading-relaxed">
              View and manage your client accounts and track their activities.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search clients..."
                value={tableState.search}
                onChange={(e) => handleSearch(e.target.value)}
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
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-8 py-6">
        {view === 'table' ? (
          <UnifiedTable
            data={filteredClients as any}
            columns={columns as ColumnDef<unknown>[]}
            loading={isLoading}
            error={error?.message}
            onRefresh={handleRefreshClick}
            onExport={handleExport}
            config={{
              features: {
                pagination: true,
                sorting: true,
                filtering: false,
                globalSearch: false,
                columnVisibility: false,
                export: false,
                refresh: false,
              },
              styling: {
                variant: 'figma',
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
          <ClientKanbanView clients={filteredClients as unknown as Client[]} />
        )}
      </div>
    </div>
  );
}
