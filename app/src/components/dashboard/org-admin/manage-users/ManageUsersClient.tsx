"use client";

import * as React from "react";
import { UserTable } from "@/components/dashboard/org-admin/manage-users/UserTable";
import { UserTableData } from "@/components/dashboard/org-admin/manage-users/columns";
import { User } from "@/types";
import { TeamTable } from "@/components/dashboard/org-admin/manage-teams/TeamTable";
import { columns as teamColumns, Team } from "@/components/dashboard/org-admin/manage-teams/columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Users, Building } from "lucide-react";
import { AddNewUserForm } from "./AddNewUserForm";
import { AddNewTeamForm } from "../manage-teams/AddNewTeamForm";
import SlideModal from "@/components/ui/SlideModal";

interface ManageUsersClientProps {
  users: User[];
  teams: Team[];
}

export function ManageUsersClient({ users, teams }: ManageUsersClientProps) {
  const [activeTab, setActiveTab] = React.useState("users");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filteredUsers, setFilteredUsers] = React.useState<User[]>(users);
  const [filteredTeams, setFilteredTeams] = React.useState<Team[]>(teams);

  // Global search function for users
  const searchAllUserColumns = (user: User, query: string): boolean => {
    const searchableFields = [
      user.name,
      user.email,
      user.phoneNumber,
      user.assignedTeam,
      user.status
    ];

    return searchableFields.some(field => 
      field.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Global search function for teams
  const searchAllTeamColumns = (team: Team, query: string): boolean => {
    const searchableFields = [
      team.teamName,
      team.teamLead,
      team.contactNumber,
      team.assignedProjects,
      team.teamMembers.map(member => member.id).join(' ')
    ];

    return searchableFields.some(field => 
      field.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Filter data based on search query
  React.useEffect(() => {
    if (searchQuery.trim()) {
      const filteredUserData = users.filter(user => 
        searchAllUserColumns(user, searchQuery)
      );
      const filteredTeamData = teams.filter(team => 
        searchAllTeamColumns(team, searchQuery)
      );
      setFilteredUsers(filteredUserData);
      setFilteredTeams(filteredTeamData);
    } else {
      setFilteredUsers(users);
      setFilteredTeams(teams);
    }
  }, [searchQuery, users, teams]);

  const managementTitle = activeTab === 'users' ? 'User Management' : 'Team Management';
  const createButtonText = activeTab === 'users' ? 'Create User' : 'Create Team';

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-white min-h-screen">
      <header className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{managementTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your user base, teams and access all the details of each user.</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search..." 
              className="pl-9 w-40 md:w-56 bg-gray-50 border-gray-200 rounded-md" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {createButtonText}
          </Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="border-b w-full justify-start rounded-none bg-transparent p-0">
          <TabsTrigger 
            value="users" 
            className="px-4 py-2 text-sm font-medium text-gray-500 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none flex items-center gap-2 transition-all"
          >
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger 
            value="teams" 
            className="px-4 py-2 text-sm font-medium text-gray-500 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none flex items-center gap-2 transition-all"
          >
            <Building className="h-4 w-4" />
            <span>Team</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="users">
            <div className="bg-white border rounded-lg shadow-sm">
              <UserTable 
                data={filteredUsers.map(user => ({
                  ...user,
                  fullName: user.name
                }))} 
              />
            </div>
          </TabsContent>
          <TabsContent value="teams">
            <div className="bg-white border rounded-lg shadow-sm">
              <TeamTable columns={teamColumns} data={filteredTeams} />
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Add User/Team Modal */}
      {isModalOpen && (
        <SlideModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={activeTab === "users" ? "Add New User" : "Add New Team"}
          width="md"
        >
          {activeTab === "users" ? (
            <AddNewUserForm 
              onFormSubmit={() => setIsModalOpen(false)} 
              onClose={() => setIsModalOpen(false)} 
            />
          ) : (
            <AddNewTeamForm 
              onFormSubmit={() => setIsModalOpen(false)} 
              onClose={() => setIsModalOpen(false)} 
            />
          )}
        </SlideModal>
      )}
    </div>
  );
}
