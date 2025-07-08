'use client';
import React, { useState, useMemo } from 'react';
import { Search, FileText, Minus } from 'lucide-react';
import { ColumnDef } from "@tanstack/react-table";
import { UnifiedTable } from "@/components/core";
import PaymentVerificationModal from "@/components/dashboard/verifier/PaymentVerificationModal";
import Image from 'next/image';
import Cancel from "@/assets/icons/Cancel.svg";
import file from "@/assets/icons/file.svg";

interface InvoiceData {
  id: string;
  "Client Name": string;
  "Deal Name": string;
  "Invoice Date": string;
  "Due Date": string;
  Amount: string;
  Status: string;
}

const VerifyInvoice = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'verification' as 'verification' | 'view',
    invoiceId: null as string | null,
    invoiceData: null as InvoiceData | null,
  });

  const invoiceData: InvoiceData[] = [
    {
      id: 'INV-001',
      "Client Name": 'Acme Co-operation',
      "Deal Name": 'CRM Integration',
      "Invoice Date": 'Aug 04, 2025',
      "Due Date": 'Aug 05, 2026',
      Amount: '$150,000.00 USD',
      Status: 'Pending'
    },
    {
      id: 'INV-002',
      "Client Name": 'Salimar Cement Pvt.Ltd',
      "Deal Name": 'Consulting Contract',
      "Invoice Date": 'Aug 04, 2025',
      "Due Date": 'Aug 05, 2026',
      Amount: '$150,000.00 USD',
      Status: 'Verified'
    },
    {
      id: 'INV-003',
      "Client Name": 'Global Solutions Pvt.Ltd',
      "Deal Name": 'American Solution.Ltd',
      "Invoice Date": 'Sep 06, 2025',
      "Due Date": 'Sep 23, 2026',
      Amount: '$150,000.00 USD',
      Status: 'Pending'
    },
    {
      id: 'INV-004',
      "Client Name": 'Chaudhary Group',
      "Deal Name": 'Consulting Contract',
      "Invoice Date": 'Oct 21, 2025',
      "Due Date": 'Oct 12, 2026',
      Amount: '$150,000.00 USD',
      Status: 'Denied'
    },
    {
      id: 'INV-005',
      "Client Name": 'Trishakti Cement Pvt.Ltd',
      "Deal Name": 'CRM Integration',
      "Invoice Date": 'Nov 31, 2025',
      "Due Date": 'Nov 19, 2026',
      Amount: '$150,000.00 USD',
      Status: 'Verified'
    },
    {
      id: 'INV-006',
      "Client Name": 'Himalayan Bank Ltd',
      "Deal Name": 'Banking Software',
      "Invoice Date": 'Dec 15, 2025',
      "Due Date": 'Dec 25, 2026',
      Amount: '$250,000.00 USD',
      Status: 'Denied'
    },
    {
      id: 'INV-007',
      "Client Name": 'Nepal Telecom',
      "Deal Name": 'Network Upgrade',
      "Invoice Date": 'Jan 10, 2026',
      "Due Date": 'Jan 20, 2026',
      Amount: '$180,000.00 USD',
      Status: 'Pending'
    },
    {
      id: 'INV-008',
      "Client Name": 'Ncell Pvt Ltd',
      "Deal Name": '5G Implementation',
      "Invoice Date": 'Feb 05, 2026',
      "Due Date": 'Feb 15, 2026',
      Amount: '$320,000.00 USD',
      Status: 'Verified'
    },
    {
      id: 'INV-009',
      "Client Name": 'World Link Pvt Ltd',
      "Deal Name": 'Fiber Expansion',
      "Invoice Date": 'Mar 01, 2026',
      "Due Date": 'Mar 11, 2026',
      Amount: '$200,000.00 USD',
      Status: 'Denied'
    }
  ];

  const getTabCount = (status: string) => {
    if (status === 'all') return invoiceData.length;
    return invoiceData.filter(invoice => 
      status === 'pending' ? invoice.Status === 'Pending' :
      status === 'completed' ? invoice.Status === 'Verified' :
      status === 'denied' ? invoice.Status === 'Denied' : false
    ).length;
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      mode: 'verification',
      invoiceId: null,
      invoiceData: null,
    });
  };

  // Filter data based on active tab and search term
  const filteredData = useMemo(() => {
    let data = invoiceData.filter(invoice => 
      activeTab === 'all' ? true :
      activeTab === 'pending' ? invoice.Status === 'Pending' :
      activeTab === 'completed' ? invoice.Status === 'Verified' :
      activeTab === 'denied' ? invoice.Status === 'Denied' : true
    );

    if (searchTerm) {
      data = data.filter(invoice =>
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice["Client Name"].toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice["Deal Name"].toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.Status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return data;
  }, [activeTab, searchTerm]);

  // Columns definition for UnifiedTable
  const columns = useMemo(() => [
    {
      accessorKey: "id",
      header: "Invoice-ID",
      size: 150,
    },
    {
      accessorKey: "Client Name",
      header: "Client Name",
      size: 200,
    },
    {
      accessorKey: "Deal Name", 
      header: "Deal Name",
      size: 180,
    },
    {
      accessorKey: "Invoice Date",
      header: "Invoice Date",
      size: 130,
    },
    {
      accessorKey: "Due Date",
      header: "Due Date", 
      size: 130,
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
              status === "Verified"
                ? "bg-green-100 text-green-800"
                : status === "Pending"
                ? "bg-orange-100 text-orange-800"
                : status === "Denied"
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
      id: "actions",
      header: "Action",
      size: 100,
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setModalState({
                isOpen: true,
                mode: 'verification',
                invoiceId: row.original.id,
                invoiceData: row.original,
              });
            }}
            className="text-white flex items-center justify-center"
            title="Open Payment Verification Form"
          >
            <Image src={file} alt="file icon"/>
          </button>
          <button
            onClick={() => console.log("Action 2 for invoice:", row.original.id)}
            className=" text-white flex items-center justify-center"
            title="Secondary Action"
          >
          <Image src={Cancel} alt="cancel icon"/>
          </button>
        </div>
      ),
    },
  ] as any, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-[28px] font-semibold text-black font-outfit">
              Verify Invoice
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Review and verify invoice submissions for approval
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[200px] pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
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
              onClick={() => setActiveTab('all')}
              className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                All Invoices
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                  {getTabCount('all')}
                </span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'pending'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                Verification Pending
                <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs">
                  {getTabCount('pending')}
                </span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'completed'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                Verification Completed
                <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                  {getTabCount('completed')}
                </span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('denied')}
              className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'denied'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                Verification Denied
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">
                  {getTabCount('denied')}
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* Invoice Table */}
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

      {/* Payment Verification Modal */}
      <PaymentVerificationModal
        isOpen={modalState.isOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseModal();
        }}
        mode={modalState.mode}
        invoiceId={modalState.invoiceId}
        invoiceData={modalState.invoiceData}
      />
    </div>
  );
};

export default VerifyInvoice; 