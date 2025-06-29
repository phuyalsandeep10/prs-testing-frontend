"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Define the shape of our data
export type TeamMember = {
  id: string;
  avatar: string; // URL to the avatar image
};

export type Team = {
  id: string;
  teamName: string;
  teamLead: string;
  contactNumber: string;
  teamMembers: TeamMember[];
  assignedProjects: string;
  extraProjectsCount?: number;
};

const TeamActions: React.FC<{ team: Team }> = ({ team }) => {
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);

  return (
    <div className="flex items-center space-x-1">
      <Button variant="ghost" size="icon" className="hover:bg-blue-50 rounded-md" onClick={() => console.log('View', team.id)}>
        <Eye className="h-5 w-5 text-blue-500" />
      </Button>
      <Button variant="ghost" size="icon" className="hover:bg-green-50 rounded-md" onClick={() => console.log('Edit', team.id)}>
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
              This action cannot be undone. This will permanently delete the team.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => console.log('Delete', team.id)} className="bg-red-600 hover:bg-red-700">Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export const columns: ColumnDef<Team>[] = [
  {
    accessorKey: "teamName",
    header: "Team Name",
  },
  {
    accessorKey: "teamLead",
    header: "Team Lead",
  },
  {
    accessorKey: "contactNumber",
    header: "Contact Number",
  },
  {
    accessorKey: "teamMembers",
    header: "Team Members",
    cell: ({ row }) => {
      const members = row.original.teamMembers;
      const displayedMembers = members.slice(0, 5);
      const remainingCount = members.length - displayedMembers.length;

      return (
        <div className="flex items-center">
          {displayedMembers.map((member) => (
            <Avatar key={member.id} className="h-8 w-8 -ml-2 border-2 border-white">
              <AvatarImage src={member.avatar} alt="Member" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          ))}
          {remainingCount > 0 && (
            <div className="h-8 w-8 -ml-2 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 border-2 border-white">
              +{remainingCount}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "assignedProjects",
    header: "Assigned Projects",
    cell: ({ row }) => {
        const projects = row.original.assignedProjects;
        const extraCount = row.original.extraProjectsCount;
        return (
            <div className="flex items-center">
                <span className="text-sm text-gray-800">{projects}</span>
                {extraCount && extraCount > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                        +{extraCount}
                    </span>
                )}
            </div>
        );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <TeamActions team={row.original} />,
  },
];
