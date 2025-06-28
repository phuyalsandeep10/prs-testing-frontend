'use client';
import React, { useState } from 'react';
import { Search, FileText, Trash2 } from 'lucide-react';

const VerifyInvoice = () => {
  const [activeTab, setActiveTab] = useState('all');

  const invoiceData = [
    {
      id: 'INV-001',
      clientName: 'Acme Co-operation',
      dealName: 'CRM Integration',
      invoiceDate: 'Aug 04, 2025',
      dueDate: 'Aug 05, 2026',
      amount: '$150,000.00 USD',
      status: 'Pending'
    },
    {
      id: 'INV-002',
      clientName: 'Salimar Cement Pvt.Ltd',
      dealName: 'Consulting Contract',
      invoiceDate: 'Aug 04, 2025',
      dueDate: 'Aug 05, 2026',
      amount: '$150,000.00 USD',
      status: 'Verified'
    },
    {
      id: 'INV-003',
      clientName: 'Global Solutions Pvt.Ltd',
      dealName: 'American Solution.Ltd',
      invoiceDate: 'Sep 06, 2025',
      dueDate: 'Sep 23, 2026',
      amount: '$150,000.00 USD',
      status: 'Pending'
    },
    {
      id: 'INV-004',
      clientName: 'Chaudhary Group',
      dealName: 'Consulting Contract',
      invoiceDate: 'Oct 21, 2025',
      dueDate: 'Oct12, 2026',
      amount: '$150,000.00 USD',
      status: 'Denied'
    },
    {
      id: 'INV-005',
      clientName: 'Trishakti Cement Pvt.Ltd',
      dealName: 'CRM Integration',
      invoiceDate: 'Nov 31, 2025',
      dueDate: 'Nov 19, 2026',
      amount: '$150,000.00 USD',
      status: 'Verified'
    },
    {
      id: 'INV-005',
      clientName: 'Trishakti Cement Pvt.Ltd',
      dealName: 'CRM Integration',
      invoiceDate: 'Nov 31, 2025',
      dueDate: 'Nov 19, 2026',
      amount: '$150,000.00 USD',
      status: 'Denied'
    },
    {
      id: 'INV-005',
      clientName: 'Trishakti Cement Pvt.Ltd',
      dealName: 'CRM Integration',
      invoiceDate: 'Nov 31, 2025',
      dueDate: 'Nov 19, 2026',
      amount: '$150,000.00 USD',
      status: 'Pending'
    },
    {
      id: 'INV-005',
      clientName: 'Trishakti Cement Pvt.Ltd',
      dealName: 'CRM Integration',
      invoiceDate: 'Nov 31, 2025',
      dueDate: 'Nov 19, 2026',
      amount: '$150,000.00 USD',
      status: 'Verified'
    },
    {
      id: 'INV-005',
      clientName: 'Trishakti Cement Pvt.Ltd',
      dealName: 'CRM Integration',
      invoiceDate: 'Nov 31, 2025',
      dueDate: 'Nov 19, 2026',
      amount: '$150,000.00 USD',
      status: 'Denied'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'text-orange-600';
      case 'Verified':
        return 'text-green-600';
      case 'Denied':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTabCount = (status: string) => {
    if (status === 'all') return invoiceData.length;
    return invoiceData.filter(invoice => 
      status === 'pending' ? invoice.status === 'Pending' :
      status === 'completed' ? invoice.status === 'Verified' :
      status === 'denied' ? invoice.status === 'Denied' : false
    ).length;
  };

  const filteredData = invoiceData.filter(invoice => 
    activeTab === 'all' ? true :
    activeTab === 'pending' ? invoice.status === 'Pending' :
    activeTab === 'completed' ? invoice.status === 'Verified' :
    activeTab === 'denied' ? invoice.status === 'Denied' : true
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Verify Invoice</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Invoice-ID</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Client Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Deal Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Invoice Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Due Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((invoice, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{invoice.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{invoice.clientName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{invoice.dealName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{invoice.invoiceDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{invoice.dueDate}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{invoice.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1 text-gray-600 hover:text-blue-600 transition-colors">
                          <FileText className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-gray-600 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            ← Previous
          </button>
          
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(num => (
              <button
                key={num}
                className={`w-8 h-8 text-sm rounded ${
                  num === 1
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {num}
              </button>
            ))}
            <span className="text-gray-400">...</span>
            {[8, 9, 10].map(num => (
              <button
                key={num}
                className="w-8 h-8 text-sm text-gray-600 hover:bg-gray-100 rounded"
              >
                {num}
              </button>
            ))}
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyInvoice; 