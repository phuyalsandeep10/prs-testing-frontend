"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// This type is updated to match the new design
export type User = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  assignedTeam: string;
  status: 'Active' | 'Inactive' | 'Invited';
};

const UserActions: React.FC<{ user: User }> = ({ user }) => {
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);

  return (
    <div className="flex items-center space-x-1">
      <Button variant="ghost" size="icon" className="hover:bg-blue-50 rounded-md" onClick={() => console.log('View', user.id)}>
        <Eye className="h-5 w-5 text-blue-500" />
      </Button>
      <Button variant="ghost" size="icon" className="hover:bg-green-50 rounded-md" onClick={() => console.log('Edit', user.id)}>
        <Edit className="h-5 w-5 text-green-500" />
      </Button>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" className="hover:bg-red-50 rounded-md">
            <Trash2 className="h-5 w-5 text-red-500" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => console.log('Delete', user.id)} className="bg-red-600 hover:bg-red-700">Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Full Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
  },
  {
    accessorKey: "assignedTeam",
    header: "Assigned Team",
  },
  {
    accessorKey: "status",
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusClasses = {
        "Active": "bg-green-100 text-green-800",
        "Invited": "bg-yellow-100 text-yellow-800",
        "Inactive": "bg-red-100 text-red-800",
      }[status] || "bg-gray-100 text-gray-800";

      return <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClasses}`}>{status}</span>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <UserActions user={row.original} />,
  },
];
