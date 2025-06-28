'use client';
import React, { useState } from 'react';
import { Search } from 'lucide-react';

const RefundChargeback = () => {
  const [activeTab, setActiveTab] = useState('refunded');

  const transactionData = [
    {
      id: 'TXN 001',
      client: 'Joshna Khadka',
      amount: '$2,000.00',
      status: 'Refunded',
      reasons: 'Customer Reports',
      dates: 'Oct-26-2025'
    },
    {
      id: 'TXN 002',
      client: 'Bomb Padka',
      amount: '$2,000.00',
      status: 'Refunded',
      reasons: 'Customer Reports',
      dates: 'Oct-26-2025'
    },
    {
      id: 'TXN 003',
      client: 'Abinash Babu Tiwari',
      amount: '$2,000.00',
      status: 'Refunded',
      reasons: 'Customer Reports',
      dates: 'Oct-26-2025'
    },
    {
      id: 'TXN 004',
      client: 'Prekxya Adhikari',
      amount: '$2,000.00',
      status: 'Refunded',
      reasons: 'Customer Reports',
      dates: 'Oct-26-2025'
    },
    {
      id: 'TXN 005',
      client: 'Yubina Koirala',
      amount: '$2,000.00',
      status: 'Refunded',
      reasons: 'Customer Reports',
      dates: 'Oct-26-2025'
    },
    {
      id: 'TXN 005',
      client: 'Yubina Koirala',
      amount: '$2,000.00',
      status: 'Refunded',
      reasons: 'Customer Reports',
      dates: 'Oct-26-2025'
    },
    {
      id: 'TXN 005',
      client: 'Yubina Koirala',
      amount: '$2,000.00',
      status: 'Refunded',
      reasons: 'Customer Reports',
      dates: 'Oct-26-2025'
    },
    {
      id: 'TXN 005',
      client: 'Yubina Koirala',
      amount: '$2,000.00',
      status: 'Refunded',
      reasons: 'Customer Reports',
      dates: 'Oct-26-2025'
    },
    {
      id: 'TXN 005',
      client: 'Yubina Koirala',
      amount: '$2,000.00',
      status: 'Refunded',
      reasons: 'Customer Reports',
      dates: 'Oct-26-2025'
    },
    {
      id: 'TXN 005',
      client: 'Yubina Koirala',
      amount: '$2,000.00',
      status: 'Refunded',
      reasons: 'Customer Reports',
      dates: 'Oct-26-2025'
    }
  ];

  const chargebackData = [
    {
      id: 'CB 001',
      client: 'Digital Labs Inc.',
      amount: '$5,000.00',
      status: 'Chargeback',
      reasons: 'Unauthorized Transaction',
      dates: 'Oct-25-2025'
    },
    {
      id: 'CB 002',
      client: 'TechCorp Solutions',
      amount: '$3,500.00',
      status: 'Chargeback',
      reasons: 'Service Dispute',
      dates: 'Oct-24-2025'
    }
  ];

  const getCurrentData = () => {
    return activeTab === 'refunded' ? transactionData : chargebackData;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">Refunded / Chargebacks</h1>
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Transactional ID</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Client</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Reasons</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Dates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getCurrentData().map((transaction, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{transaction.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{transaction.client}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{transaction.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${
                        transaction.status === 'Refunded' 
                          ? 'text-pink-600' 
                          : transaction.status === 'Chargeback'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{transaction.reasons}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{transaction.dates}</td>
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

export default RefundChargeback; 