"use client";

import * as React from "react";
import { Eye, Edit, Trash2, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { UserTableData } from "./columns";

interface UserTableProps {
  data: UserTableData[];
  onView?: (user: UserTableData) => void;
  onEdit?: (user: UserTableData) => void;
  onDelete?: (user: UserTableData) => void;
}

export function UserTable({ data, onView, onEdit, onDelete }: UserTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof UserTableData;
    direction: 'asc' | 'desc' | null;
  }>({ key: 'fullName', direction: null });

  const sortedData = useMemo(() => {
    if (sortConfig.direction === null) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const handleSort = (key: keyof UserTableData) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' 
        ? 'desc' 
        : current.key === key && current.direction === 'desc'
        ? null
        : 'asc'
    }));
  };

  const getSortIcon = (key: keyof UserTableData) => {
    if (sortConfig.key !== key || sortConfig.direction === null) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-[#4F46E5]" />
      : <ChevronDown className="h-4 w-4 text-[#4F46E5]" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Exact Figma Header Design - Purple Background */}
          <thead className="bg-[#F1F0FF] border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('fullName')}
                  className="flex items-center gap-2 text-[14px] font-semibold text-gray-900 hover:text-[#4F46E5] transition-colors"
                >
                  Full Name
                  {getSortIcon('fullName')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('email')}
                  className="flex items-center gap-2 text-[14px] font-semibold text-gray-900 hover:text-[#4F46E5] transition-colors"
                >
                  Email
                  {getSortIcon('email')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('phoneNumber')}
                  className="flex items-center gap-2 text-[14px] font-semibold text-gray-900 hover:text-[#4F46E5] transition-colors"
                >
                  Contact Number
                  {getSortIcon('phoneNumber')}
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button
                  onClick={() => handleSort('assignedTeam')}
                  className="flex items-center gap-2 text-[14px] font-semibold text-gray-900 hover:text-[#4F46E5] transition-colors"
                >
                  Assigned Team
                  {getSortIcon('assignedTeam')}
                </button>
              </th>
              <th className="px-6 py-4 text-left text-[14px] font-semibold text-gray-900">
                Status
              </th>
              <th className="px-6 py-4 text-center text-[14px] font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody className="divide-y divide-gray-100">
            {sortedData.map((user, index) => (
              <tr 
                key={user.id} 
                className={`hover:bg-gray-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                }`}
              >
                <td className="px-6 py-4">
                  <div className="text-[14px] font-medium text-gray-900">
                    {user.fullName}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[14px] text-gray-700">
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[14px] text-gray-700">
                    {user.phoneNumber}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-[14px] text-gray-700">
                    {user.assignedTeam || "Not Assigned"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {/* Exact Figma Status Badge Design */}
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium ${
                      user.status === 'active'
                        ? 'bg-[#E6F7FF] text-[#16A34A]'
                        : user.status === 'invited'
                        ? 'bg-[#FFF7ED] text-[#EA580C]'
                        : 'bg-[#FEF2F2] text-[#DC2626]'
                    }`}
                  >
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {/* Exact Figma Action Buttons - Circular Design */}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onView(user)}
                      className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center hover:bg-[#4338CA] transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onEdit(user)}
                      className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center hover:bg-[#4338CA] transition-colors"
                      title="Edit User"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(user)}
                      className="w-8 h-8 rounded-full bg-[#EF4444] text-white flex items-center justify-center hover:bg-[#DC2626] transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer - Exact Figma Design */}
      <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-[14px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
            ← Previous
          </button>
        </div>
        
        <div className="flex items-center gap-1">
          <button className="w-9 h-9 flex items-center justify-center text-[14px] bg-[#4F46E5] text-white rounded-lg transition-colors font-medium">
            1
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-[14px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
            2
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-[14px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
            3
          </button>
          <span className="text-[14px] text-gray-400 mx-2">...</span>
          <button className="w-9 h-9 flex items-center justify-center text-[14px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
            8
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-[14px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
            9
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-[14px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
            10
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-[14px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
