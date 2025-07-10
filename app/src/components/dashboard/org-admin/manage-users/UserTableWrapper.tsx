"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { UnifiedTable } from "@/components/core/UnifiedTable";
import { Eye, Edit, Trash2, AlertTriangle } from "lucide-react";
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

export function UserTable({ 
  data, 
  onView, 
  onEdit, 
  onDelete, 
  pagination, 
  deletingUserId 
}: UserTableProps) {
  // Create columns with actions
  const columns: ColumnDef<UserTableData>[] = React.useMemo(() => [
    {
      accessorKey: "fullName",
      header: "Full Name",
      cell: ({ row }) => (
        <div className="text-[14px] font-medium text-gray-900">
          {row.getValue("fullName")}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-[14px] text-gray-700">
          {row.getValue("email")}
        </div>
      ),
    },
    {
      accessorKey: "phoneNumber",
      header: "Contact Number",
      cell: ({ row }) => (
        <div className="text-[14px] text-gray-700">
          {row.getValue("phoneNumber")}
        </div>
      ),
    },
    {
      accessorKey: "assignedTeam",
      header: "Assigned Team",
      cell: ({ row }) => (
        <div className="text-[14px] text-gray-700">
          {row.getValue("assignedTeam") || "Not Assigned"}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as UserTableData["status"];
        return (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium ${
              status === 'active'
                ? 'bg-[#E6F7FF] text-[#16A34A]'
                : status === 'invited'
                ? 'bg-[#FFF7ED] text-[#EA580C]'
                : 'bg-[#FEF2F2] text-[#DC2626]'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => onView?.(user)}
              className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center hover:bg-[#4338CA] transition-colors"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => onEdit?.(user)}
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
        );
      },
    },
  ], [onView, onEdit, onDelete, deletingUserId]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <UnifiedTable
        data={data}
        columns={columns as ColumnDef<unknown>[]}
        config={{
          features: {
            pagination: true,
            sorting: true,
            filtering: false,
            selection: false,
            expansion: false,
            columnVisibility: false,
            globalSearch: false,
            export: false,
            refresh: false,
          },
          styling: {
            variant: "user",
            size: "md",
            striped: true,
            bordered: false,
            hover: true,
          },
          pagination: {
            pageSize: pagination?.pageSize || 10,
            page: pagination?.page,
            total: pagination?.total,
            onPageChange: pagination?.onPageChange,
            showSizeSelector: true,
            showInfo: true,
          },
          messages: {
            loading: "Loading users...",
            empty: "No users found",
            error: "Failed to load users",
          },
        }}
      />
    </div>
  );
} 