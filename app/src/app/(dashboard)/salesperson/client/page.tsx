"use client";

import React, { useState, useMemo } from 'react';
import { Eye, Edit, Trash2, Plus, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { UnifiedTable } from "@/components/core";
import { getClients } from '@/data/clients';
import type { Client } from '@/types';
import Clientform from '@/components/salesperson/clients/Clientform';
import EditClient from '@/components/salesperson/clients/editClient';
import SlideModal from '@/components/ui/SlideModal';

const ClientsPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const clients = useMemo(() => getClients(), []);

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

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setShowEditModal(true);
  };

  const handleDelete = (clientId: string) => {
    console.log('Delete client:', clientId);
  };

  const handleView = (client: Client) => {
    console.log('View client:', client);
  };

  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "name",
      header: "Client Name",
      cell: ({ row }) => (
        <div className="text-[14px] font-medium text-gray-900">
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: "activeDate",
      header: "Active Date",
      cell: ({ row }) => (
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
      cell: ({ row }) => {
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
      cell: ({ row }) => {
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
      cell: ({ row }) => (
        <div className="text-[14px] text-gray-700 truncate max-w-[200px]">
          {row.getValue("remarks")}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
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
  ];

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
            {/* Search Input - RIGHT SIDE as per Figma */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-[320px] h-[44px] text-[14px] bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            {/* Create Button - RIGHT SIDE as per Figma */}
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

      {/* Table Container */}
      <div className="px-8 py-6">
        <UnifiedTable
          data={clients}
          columns={columns}
          config={{
            features: {
              pagination: true,
              sorting: true,
              filtering: true,
              globalSearch: true,
              columnVisibility: true,
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
              searchPlaceholder: 'Search clients...',
            },
          }}
        />
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <SlideModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Client"
          width="xl"
        >
          <Clientform />
        </SlideModal>
      )}

      {/* Edit Client Modal */}
      {showEditModal && selectedClient && (
        <SlideModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Client"
          width="xl"
        >
          <EditClient inModal={true} onSuccess={() => setShowEditModal(false)} />
        </SlideModal>
      )}
    </div>
  );
};

export default ClientsPage;