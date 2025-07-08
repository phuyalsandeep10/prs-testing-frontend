"use client";

import * as React from "react";
import { Eye, Edit, Trash2, ChevronUp, ChevronDown, ArrowUpDown, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

// Type for table data
export interface UserTableData {
  id: string;
  name: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  assignedTeam: string;
  status: 'active' | 'inactive' | 'invited';
}

interface UserTableProps {
  data: UserTableData[];
  onView?: (user: UserTableData) => void;
  onEdit?: (user: UserTableData) => void;
  onDelete?: (user: UserTableData) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  deletingUserId?: string | null;
}

export function UserTable({ data, onView, onEdit, onDelete, pagination, deletingUserId }: UserTableProps) {
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
                    {/* Delete with confirmation popup */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          className="w-8 h-8 rounded-full bg-[#EF4444] text-white flex items-center justify-center hover:bg-[#DC2626] transition-colors disabled:opacity-50"
                          title="Delete User"
                          disabled={deletingUserId === user.id}
                        >
                          {deletingUserId === user.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white border-2 border-red-100 shadow-xl max-w-md">
                        <AlertDialogHeader className="text-center pb-4">
                          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                          </div>
                          <AlertDialogTitle className="text-xl font-bold text-red-600 mb-2">
                            Delete User
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-700 leading-relaxed">
                            Are you sure you want to delete <strong className="text-red-600">{user.fullName}</strong>?<br/><br/>
                            <span className="text-red-500 font-medium">⚠️ This action cannot be undone.</span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex gap-3 pt-4">
                          <AlertDialogCancel className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete?.(user)}
                            className="flex-1 bg-red-500 hover:bg-red-600 focus:ring-red-500 text-white font-semibold"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer - Proper Implementation */}
      {pagination && (
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-4 py-2 text-[14px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <span className="text-[14px] text-gray-500">
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.pageSize)) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => pagination.onPageChange(pageNum)}
                  className={`w-9 h-9 flex items-center justify-center text-[14px] rounded-lg transition-colors font-medium ${
                    pagination.page === pageNum
                      ? 'bg-[#4F46E5] text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {Math.ceil(pagination.total / pagination.pageSize) > 5 && (
              <>
                <span className="text-[14px] text-gray-400 mx-2">...</span>
                <button
                  onClick={() => pagination.onPageChange(Math.ceil(pagination.total / pagination.pageSize))}
                  className="w-9 h-9 flex items-center justify-center text-[14px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                >
                  {Math.ceil(pagination.total / pagination.pageSize)}
                </button>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              className="px-4 py-2 text-[14px] text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
