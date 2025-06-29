'use client';
import React, { useState, useMemo } from 'react';
import { Search, Eye, Trash2 } from 'lucide-react';
import { ColumnDef } from "@tanstack/react-table";
import { UnifiedTable } from "@/components/core";

interface TransactionData {
  id: string;
  "Client": string;
  "Amount": string;
  "Status": string;
  "Reasons": string;
  "Dates": string;
}

const RefundChargeback = () => {
  const [activeTab, setActiveTab] = useState('refunded');
  const [searchTerm, setSearchTerm] = useState('');

  const transactionData: TransactionData[] = [
    {
      id: 'TXN 001',
      "Client": 'Joshna Khadka',
      "Amount": '$2,000.00',
      "Status": 'Refunded',
      "Reasons": 'Customer Reports',
      "Dates": 'Oct-26-2025'
    },
    {
      id: 'TXN 002',
      "Client": 'Bomb Padka',
      "Amount": '$2,000.00',
      "Status": 'Refunded',
      "Reasons": 'Customer Reports',
      "Dates": 'Oct-26-2025'
    },
    {
      id: 'TXN 003',
      "Client": 'Abinash Babu Tiwari',
      "Amount": '$2,000.00',
      "Status": 'Refunded',
      "Reasons": 'Customer Reports',
      "Dates": 'Oct-26-2025'
    },
    {
      id: 'TXN 004',
      "Client": 'Prekxya Adhikari',
      "Amount": '$2,000.00',
      "Status": 'Refunded',
      "Reasons": 'Customer Reports',
      "Dates": 'Oct-26-2025'
    },
    {
      id: 'TXN 005',
      "Client": 'Yubina Koirala',
      "Amount": '$2,000.00',
      "Status": 'Refunded',
      "Reasons": 'Customer Reports',
      "Dates": 'Oct-26-2025'
    },
    {
      id: 'TXN 006',
      "Client": 'Ramesh Sharma',
      "Amount": '$3,500.00',
      "Status": 'Refunded',
      "Reasons": 'Service Issue',
      "Dates": 'Oct-25-2025'
    },
    {
      id: 'TXN 007',
      "Client": 'Maya Devi',
      "Amount": '$1,800.00',
      "Status": 'Refunded',
      "Reasons": 'Product Defect',
      "Dates": 'Oct-24-2025'
    },
    {
      id: 'TXN 008',
      "Client": 'Suresh Thapa',
      "Amount": '$4,200.00',
      "Status": 'Refunded',
      "Reasons": 'Customer Reports',
      "Dates": 'Oct-23-2025'
    },
    {
      id: 'TXN 009',
      "Client": 'Anita Gurung',
      "Amount": '$2,750.00',
      "Status": 'Refunded',
      "Reasons": 'Wrong Delivery',
      "Dates": 'Oct-22-2025'
    },
    {
      id: 'TXN 010',
      "Client": 'Dipesh Rai',
      "Amount": '$3,100.00',
      "Status": 'Refunded',
      "Reasons": 'Customer Reports',
      "Dates": 'Oct-21-2025'
    }
  ];

  const chargebackData: TransactionData[] = [
    {
      id: 'CB 001',
      "Client": 'Digital Labs Inc.',
      "Amount": '$5,000.00',
      "Status": 'Chargeback',
      "Reasons": 'Unauthorized Transaction',
      "Dates": 'Oct-25-2025'
    },
    {
      id: 'CB 002',
      "Client": 'TechCorp Solutions',
      "Amount": '$3,500.00',
      "Status": 'Chargeback',
      "Reasons": 'Service Dispute',
      "Dates": 'Oct-24-2025'
    },
    {
      id: 'CB 003',
      "Client": 'Innovation Hub Ltd',
      "Amount": '$7,800.00',
      "Status": 'Chargeback',
      "Reasons": 'Fraud Claim',
      "Dates": 'Oct-23-2025'
    },
    {
      id: 'CB 004',
      "Client": 'Global Tech Corp',
      "Amount": '$4,200.00',
      "Status": 'Chargeback',
      "Reasons": 'Billing Error',
      "Dates": 'Oct-22-2025'
    }
  ];

  // Filter data based on active tab and search term
  const filteredData = useMemo(() => {
    let data = activeTab === 'refunded' ? transactionData : chargebackData;

    if (searchTerm) {
      data = data.filter(transaction =>
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction["Client"].toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction["Status"].toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction["Reasons"].toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return data;
  }, [activeTab, searchTerm]);

  // Columns definition for UnifiedTable
  const columns = useMemo(() => [
    {
      accessorKey: "id",
      header: "Transactional ID",
      size: 150,
    },
    {
      accessorKey: "Client",
      header: "Client",
      size: 200,
    },
    {
      accessorKey: "Amount", 
      header: "Amount",
      size: 140,
    },
    {
      accessorKey: "Status",
      header: "Status",
      size: 120,
      cell: ({ row }: any) => {
        const status = row.getValue("Status") as string;
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              status === "Refunded"
                ? "bg-pink-100 text-pink-800"
                : status === "Chargeback"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "Reasons",
      header: "Reasons", 
      size: 180,
    },
    {
      accessorKey: "Dates",
      header: "Dates",
      size: 130,
    },
  ] as any, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[28px] font-semibold text-black font-outfit">
              Refund & Chargeback
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Monitor and manage refunded transactions and chargeback claims
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[320px] pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex gap-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('refunded')}
              className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'refunded'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Refunded
            </button>
            <button
              onClick={() => setActiveTab('chargeback')}
              className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'chargeback'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Chargeback
            </button>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <UnifiedTable
            data={filteredData}
            columns={columns}
            config={{
              styling: { variant: "figma" },
              features: { 
                pagination: true,
                globalSearch: false,
                filtering: false,
                export: false,
                refresh: false,
                columnVisibility: false
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default RefundChargeback; 