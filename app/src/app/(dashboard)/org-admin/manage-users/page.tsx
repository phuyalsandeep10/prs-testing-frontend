"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserTable } from "@/components/dashboard/org-admin/manage-users/UserTable";
import { TeamsTable } from "@/components/dashboard/org-admin/manage-teams/TeamsTable";
import { AddNewUserForm } from "@/components/dashboard/org-admin/manage-users/AddNewUserForm";
import { AddNewTeamForm } from "@/components/dashboard/org-admin/manage-teams/AddNewTeamForm";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import SlideModal from "@/components/ui/SlideModal";
import { toast } from "sonner";
import { 
  useUsersQuery, 
  useTeamsQuery, 
  useDeleteUserMutation, 
  useDeleteTeamMutation 
} from "@/hooks/useIntegratedQuery";

type TabType = "users" | "team";
type ModalType =
  | "add-user"
  | "add-team"
  | "edit-team"
  | "view-team"
  | "edit-user"
  | "view-user"
  | null;

interface Project {
  id: number;
  name: string;
}

// Type definitions for API data
interface ApiUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_number?: string;
  phoneNumber?: string; // Alias from backend serializer
  role?: {
    id: number;
    name: string;
  };
  organization: number;
  teams?: number[] | Array<{ id: number; name: string }>;
  is_active: boolean;
  date_joined: string;
}

// Type for transformed table data
interface UserTableData {
  id: string;
  name: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  assignedTeam: string;
  status: 'active' | 'inactive' | 'invited';
}

interface Team {
  id: number;
  name: string;
  organization: number;
  team_lead: {
    id: number;
    username: string;
  } | null;
  members: {
    id: number;
    username: string;
  }[];
  projects: number[]; // Just project IDs
  contact_number?: string;
  created_at: string;
}

export default function ManageUsersPage() {
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);
  
  // Pagination state
  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [teamsPagination, setTeamsPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  // API Hooks - React Query will handle loading, error states, and caching
  const { 
    data: usersResponse, 
    isLoading: usersLoading, 
    error: usersError,
    refetch: refetchUsers 
  } = useUsersQuery();
  
  const { 
    data: teamsResponse, 
    isLoading: teamsLoading, 
    error: teamsError,
    refetch: refetchTeams 
  } = useTeamsQuery();
  
  const deleteUserMutation = useDeleteUserMutation();
  const deleteTeamMutation = useDeleteTeamMutation();

  // Extract data from API responses
  // Handle both direct array responses and nested data responses
  const users = Array.isArray(usersResponse) ? usersResponse : (usersResponse?.data || []);
  const teams = Array.isArray(teamsResponse) ? teamsResponse : (teamsResponse?.data || []);
  const projects: Project[] = []; // This seems unused in the original, keeping for compatibility

  // Debug logging
  console.log('=== MANAGE USERS DEBUG ===');
  console.log('usersResponse:', usersResponse);
  console.log('extracted users:', users);
  console.log('users length:', users.length);
  console.log('teamsResponse:', teamsResponse);
  console.log('extracted teams:', teams);
  console.log('teams length:', teams.length);

  // Computed values for filtering and pagination
  const filteredUsers = useMemo(() => {
    console.log('=== FILTERING USERS ===');
    console.log('users input:', users);
    console.log('users array check:', Array.isArray(users));
    console.log('searchTerm:', searchTerm);
    
    if (!users) return [];
    const filtered = users.filter(user => {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      const email = user.email?.toLowerCase() || '';
      const searchLower = searchTerm.toLowerCase();
      return fullName.includes(searchLower) || email.includes(searchLower);
    });
    
    console.log('filtered users result:', filtered);
    console.log('filtered users length:', filtered.length);
    return filtered;
  }, [users, searchTerm]);

  const filteredTeams = useMemo(() => {
    console.log('=== FILTERING TEAMS ===');
    console.log('teams input:', teams);
    console.log('teams array check:', Array.isArray(teams));
    console.log('searchTerm:', searchTerm);
    
    if (!teams) return [];
    const filtered = teams.filter(team => {
      const teamName = team.name?.toLowerCase() || '';
      const searchLower = searchTerm.toLowerCase();
      return teamName.includes(searchLower);
    });
    
    console.log('filtered teams result:', filtered);
    console.log('filtered teams length:', filtered.length);
    return filtered;
  }, [teams, searchTerm]);

  // Update pagination totals when data changes
  useEffect(() => {
    setUsersPagination(prev => ({ ...prev, total: filteredUsers.length }));
  }, [filteredUsers.length]);

  useEffect(() => {
    setTeamsPagination(prev => ({ ...prev, total: filteredTeams.length }));
  }, [filteredTeams.length]);

  // Event handlers for form completion - React Query will auto-refresh
  const handleTeamCreated = () => {
    console.log('=== TEAM CREATED EVENT TRIGGERED ===');
    toast.success("Team created successfully");
    // React Query will automatically refetch due to cache invalidation in the mutation
  };

  const handleUserCreated = () => {
    toast.success("User created successfully");
    // React Query will automatically refetch due to cache invalidation in the mutation
  };

  const handleUserUpdated = () => {
    toast.success("User updated successfully");
    // React Query will automatically refetch due to cache invalidation in the mutation
  };

  const handleTeamUpdated = () => {
    toast.success("Team updated successfully");
    // React Query will automatically refetch due to cache invalidation in the mutation
  };

  // Listen for custom events (keeping for compatibility)
  useEffect(() => {
    window.addEventListener("userCreated", handleUserCreated);
    window.addEventListener("userUpdated", handleUserUpdated);
    window.addEventListener("teamCreated", handleTeamCreated);
    window.addEventListener("teamUpdated", handleTeamUpdated);

    return () => {
      window.removeEventListener("userCreated", handleUserCreated);
      window.removeEventListener("userUpdated", handleUserUpdated);
      window.removeEventListener("teamCreated", handleTeamCreated);
      window.removeEventListener("teamUpdated", handleTeamUpdated);
    };
  }, []);

  const usersForForm = useMemo(() => users.map(u => ({
    id: u.id,
    name: `${u.first_name} ${u.last_name}`.trim() || u.email,
    email: u.email,
    role: typeof u.role === 'string' ? u.role : (u.role as any)?.name || 'N/A',
  })), [users]);

  // Get paginated data
  const paginatedUsers = useMemo(() => {
    console.log('=== PAGINATING USERS ===');
    console.log('filteredUsers:', filteredUsers);
    console.log('usersPagination:', usersPagination);
    
    const startIndex = (usersPagination.page - 1) * usersPagination.pageSize;
    const endIndex = startIndex + usersPagination.pageSize;
    const paginated = filteredUsers.slice(startIndex, endIndex);
    
    console.log('startIndex:', startIndex, 'endIndex:', endIndex);
    console.log('paginated users result:', paginated);
    console.log('paginated users length:', paginated.length);
    return paginated;
  }, [filteredUsers, usersPagination.page, usersPagination.pageSize]);

  const paginatedTeams = useMemo(() => {
    console.log('=== PAGINATING TEAMS ===');
    console.log('filteredTeams:', filteredTeams);
    console.log('teamsPagination:', teamsPagination);
    
    const startIndex = (teamsPagination.page - 1) * teamsPagination.pageSize;
    const endIndex = startIndex + teamsPagination.pageSize;
    const paginated = filteredTeams.slice(startIndex, endIndex);
    
    console.log('startIndex:', startIndex, 'endIndex:', endIndex);
    console.log('paginated teams result:', paginated);
    console.log('paginated teams length:', paginated.length);
    return paginated;
  }, [filteredTeams, teamsPagination.page, teamsPagination.pageSize]);

  // Transform API data to table format
  const transformUsersForTable = useCallback((users: ApiUser[]): UserTableData[] => {
    console.log('=== TRANSFORMING USERS FOR TABLE ===');
    console.log('users input to transform:', users);
    console.log('users length:', users.length);
    
    const transformed = users.map((user) => {
      console.log('transforming user:', user);
      const teamNames = Array.isArray(user.teams) && user.teams.length > 0
        ? user.teams.map((t) => typeof t === 'object' && t !== null ? t.name : t).join(", ")
        : "Not Assigned";

      const transformedUser = {
        id: user.id.toString(),
        name: `${user.first_name} ${user.last_name}`.trim() || user.email,
        fullName: `${user.first_name} ${user.last_name}`.trim() || user.email,
        email: user.email,
        phoneNumber: user.phoneNumber || user.contact_number || "N/A",
        role: user.role?.name ? user.role.name.toLowerCase().replace(/[\s-]+/g, "-") : "user",
        assignedTeam: teamNames,
        status: user.is_active ? "active" : "inactive" as "active" | "inactive",
      };
      
      console.log('transformed user result:', transformedUser);
      return transformedUser;
    });
    
    console.log('final transformed users:', transformed);
    return transformed;
  }, []);

  const transformTeamsForTable = useCallback((teams: Team[]) => {
    console.log('=== TRANSFORM TEAMS DEBUG ===');
    console.log('Input teams for transform:', teams);
    console.log('Projects for mapping:', projects);
    
    const transformed = teams.map((team) => {
      console.log('Transforming team:', team);
      console.log('Team lead raw:', team.team_lead);
      console.log('Team members raw:', team.members);
      console.log('Team projects raw:', team.projects);
      
      const transformedTeam = {
        id: team.id.toString(),
        teamName: team.name,
        teamLead: team.team_lead 
          ? team.team_lead.username || "Unknown Lead"
          : "No Lead",
        contactNumber: team.contact_number || "N/A",
        teamMembers:
          team.members?.map((m) => ({
            id: m.id.toString(),
            name: m.username || "Unknown Member",
            avatar: `https://ui-avatars.com/api/?name=${m.username}&background=random`,
          })) || [],
        assignedProjects:
          team.projects?.map((projectId) => {
            const project = projects.find((p) => p.id === projectId);
            return project?.name || `Project ${projectId}`;
          }).join(", ") || "No projects",
        extraProjectsCount:
          team.projects && team.projects.length > 1
            ? team.projects.length - 1
            : 0,
      };
      
      console.log('Transformed team result:', transformedTeam);
      return transformedTeam;
    });

    console.log('Final transformed teams:', transformed);
    return transformed;
  }, [projects]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleViewTeam = (team: any) => {
    setSelectedTeam(team);
    setOpenModal("view-team");
  };

  const handleEditTeam = (team: any) => {
    setSelectedTeam(team);
    setOpenModal("edit-team");
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setOpenModal("view-user");
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setOpenModal("edit-user");
  };

  const handleCloseModal = () => {
    setOpenModal(null);
    setSelectedTeam(null);
    setSelectedUser(null);
  };

  // Pagination handlers
  const handleUsersPageChange = (page: number) => {
    setUsersPagination(prev => ({ ...prev, page }));
  };

  const handleTeamsPageChange = (page: number) => {
    setTeamsPagination(prev => ({ ...prev, page }));
  };

  // DELETE handlers
  const handleDeleteUser = async (userData: any) => {
    setDeletingUserId(userData.id);
    try {
      await deleteUserMutation.mutateAsync(userData.id);
      // Success notification is handled by the mutation
    } catch (error) {
      // Error notification is handled by the mutation
      console.error("Delete user failed:", error);
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleDeleteTeam = async (teamData: any) => {
    setDeletingTeamId(teamData.id);
    try {
      await deleteTeamMutation.mutateAsync(teamData.id);
      // Success notification is handled by the mutation
    } catch (error) {
      // Error notification is handled by the mutation
      console.error("Delete team failed:", error);
    } finally {
      setDeletingTeamId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Exact Figma Header Implementation - Full Width */}
      <div className="bg-white px-8 py-8 border-b border-gray-100">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-semibold text-gray-900 mb-2">
              {activeTab === "users" ? "User Management" : "Team Management"}
            </h1>
            <p className="text-[16px] text-gray-500 leading-relaxed">
              Manage your user base, teams and access all the details of each
              user.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Search Input - RIGHT SIDE as per Figma */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search users and teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 w-[320px] h-[44px] text-[14px] bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            {/* Create Button - RIGHT SIDE as per Figma */}
            <Button
              onClick={() =>
                setOpenModal(activeTab === "users" ? "add-user" : "add-team")
              }
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 py-3 h-[44px] rounded-lg font-medium text-[14px] flex items-center gap-2 transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" />
              {activeTab === "users" ? "Create User" : "Create Team"}
            </Button>
          </div>
        </div>

        {/* Exact Figma Tabs Implementation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-12 -mb-px">
            <button
              onClick={() => handleTabChange("users")}
              className={`pb-4 px-1 text-[16px] font-medium transition-all relative ${
                activeTab === "users"
                  ? "text-[#4F46E5] border-b-2 border-[#4F46E5]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-[18px]">👤</span>
                Users
              </span>
            </button>
            <button
              onClick={() => handleTabChange("team")}
              className={`pb-4 px-1 text-[16px] font-medium transition-all relative ${
                activeTab === "team"
                  ? "text-[#4F46E5] border-b-2 border-[#4F46E5]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-[18px]">👥</span>
                Team
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Table Container - Direct Integration with Figma Layout */}
      <div className="px-8 py-6">
        {/* Search Results Indicator */}
        {searchTerm.trim() && (
          <div className="mb-4 text-sm text-gray-600">
            {activeTab === "users"
              ? `Found ${filteredUsers.length} user(s) matching "${searchTerm}"`
              : `Found ${filteredTeams.length} team(s) matching "${searchTerm}"`}
          </div>
        )}

        <ErrorBoundary>
          {(usersLoading || teamsLoading) ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5] mx-auto mb-4"></div>
                <p className="text-gray-600">
                  Loading {activeTab === "users" ? "users" : "teams"}...
                </p>
              </div>
            </div>
          ) : activeTab === "users" ? (
            filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No users found</p>
                <p className="text-gray-500 mb-4">
                  Start by creating your first user.
                </p>
                <Button
                  onClick={() => setOpenModal("add-user")}
                  className="bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                >
                  Add First User
                </Button>
              </div>
            ) : (
              (() => {
                const tableData = transformUsersForTable(paginatedUsers as any);
                console.log('=== RENDERING USER TABLE ===');
                console.log('table data being passed to UserTable:', tableData);
                console.log('table data length:', tableData.length);
                console.log('pagination props:', {
                  page: usersPagination.page,
                  pageSize: usersPagination.pageSize,
                  total: usersPagination.total,
                });
                return (
                  <UserTable
                    data={tableData}
                    onView={handleViewUser}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUser}
                    pagination={{
                      page: usersPagination.page,
                      pageSize: usersPagination.pageSize,
                      total: usersPagination.total,
                      onPageChange: handleUsersPageChange,
                    }}
                    deletingUserId={deletingUserId}
                  />
                );
              })()
            )
          ) : (
            filteredTeams.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No teams found</p>
                <p className="text-gray-500 mb-4">
                  Start by creating your first team.
                </p>
                <Button
                  onClick={() => setOpenModal("add-team")}
                  className="bg-[#4F46E5] hover:bg-[#4338CA] text-white"
                >
                  Add First Team
                </Button>
              </div>
            ) : (
                          <TeamsTable
              data={transformTeamsForTable(paginatedTeams as any)}
              onView={handleViewTeam}
              onEdit={handleEditTeam}
              onDelete={handleDeleteTeam}
              pagination={{
                page: teamsPagination.page,
                pageSize: teamsPagination.pageSize,
                total: teamsPagination.total,
                onPageChange: handleTeamsPageChange,
              }}
              deletingTeamId={deletingTeamId}
            />
            )
          )}
        </ErrorBoundary>
      </div>

      {/* View Team Modal */}
      <SlideModal
        isOpen={openModal === "view-team"}
        onClose={handleCloseModal}
        title="Team Details"
        width="md"
        showCloseButton={true}
      >
        {selectedTeam && (
          <TeamDetailView
            team={selectedTeam}
            onClose={handleCloseModal}
          />
        )}
      </SlideModal>

      {/* View User Modal */}
      <SlideModal
        isOpen={openModal === "view-user"}
        onClose={handleCloseModal}
        title="User Details"
        width="md"
        showCloseButton={true}
      >
        {selectedUser && (
          <UserDetailView
            user={selectedUser}
            onClose={handleCloseModal}
          />
        )}
      </SlideModal>

      {/* Add User Modal */}
      <SlideModal
        isOpen={openModal === "add-user"}
        onClose={handleCloseModal}
        title="Add New User"
        width="md"
        showCloseButton={true}
      >
        <AddNewUserForm onClose={handleCloseModal} onFormSubmit={handleUserCreated}/>
      </SlideModal>

      {/* Add Team Modal */}
      <SlideModal
        isOpen={openModal === "add-team"}
        onClose={handleCloseModal}
        title="Add New Team"
        width="md"
        showCloseButton={true}
      >
        <AddNewTeamForm onClose={handleCloseModal} onFormSubmit={handleTeamCreated}/>
      </SlideModal>

      {/* Edit Team Modal */}
      <SlideModal
        isOpen={openModal === "edit-team"}
        onClose={handleCloseModal}
        title="Edit Team"
        width="md"
        showCloseButton={true}
      >
        {selectedTeam && (
          <EditTeamForm
            team={selectedTeam}
            onClose={handleCloseModal}
          />
        )}
      </SlideModal>

      {/* Edit User Modal */}
      <SlideModal
        isOpen={openModal === "edit-user"}
        onClose={handleCloseModal}
        title="Edit User"
        width="md"
        showCloseButton={true}
      >
        {selectedUser && (
          <EditUserForm
            user={selectedUser}
            onClose={handleCloseModal}
          />
        )}
      </SlideModal>
    </div>
  );
}

// User Detail View Component - Exact Figma Card Design
function UserDetailView({ user, onClose }: { user: any; onClose: () => void }) {
  return (
    <div className="relative">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-semibold text-[#4F46E5]">
            {user.fullName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge
            className={
              user.status === "Active"
                ? "bg-green-100 text-green-800 px-2 py-1 text-[12px] rounded-full border-0"
                : "bg-red-100 text-red-800 px-2 py-1 text-[12px] rounded-full border-0"
            }
          >
            {user.status}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4 space-y-4">
        <div className="space-y-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <h3 className="text-[14px] font-medium text-gray-900 mb-2">
              Contact Information
            </h3>
            <div className="space-y-1">
              <p className="text-[14px] text-gray-600">
                <span className="font-medium text-gray-900">Email:</span>{" "}
                {user.email}
              </p>
              <p className="text-[14px] text-gray-600">
                <span className="font-medium text-gray-900">Phone:</span>{" "}
                {user.phoneNumber}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <h3 className="text-[14px] font-medium text-gray-900 mb-2">
              Team Assignment
            </h3>
            <p className="text-[14px] text-gray-600">
              <span className="font-medium text-gray-900">Team:</span>{" "}
              {user.assignedTeam}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Edit User Form Component - Standalone (Not Nested)
function EditUserForm({ user, onClose }: { user: any; onClose: () => void }) {
  return <AddNewUserForm onClose={onClose} initialData={user} isEdit={true} />;
}

// Team Detail View Component - Exact Figma Card Design
function TeamDetailView({ team, onClose }: { team: any; onClose: () => void }) {
  const [showAllMembers, setShowAllMembers] = React.useState(false);
  const displayMembers = showAllMembers
    ? team.teamMembers
    : team.teamMembers.slice(0, 3);
  const hasMoreMembers = team.teamMembers.length > 3;

  return (
    <div className="relative">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-semibold text-[#4F46E5]">
            {team.teamName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-4 space-y-4">
        <div className="space-y-2">
          <p className="text-[14px] text-gray-600">
            <span className="font-medium text-gray-900">
              Number of members:
            </span>{" "}
            {team.teamMembers.length}
          </p>
          <p className="text-[14px] text-gray-600">
            <span className="font-medium text-gray-900">Team Lead:</span>{" "}
            {team.teamLead}
          </p>
          <p className="text-[14px] text-gray-600">
            <span className="font-medium text-gray-900">Contact No:</span>{" "}
            {team.contactNumber.replace(" - ", "")}
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-medium text-gray-900 mb-3">
            Team Members
          </h3>
          <div className="space-y-2">
            {displayMembers.map((member: any) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
              >
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[11px] font-medium">
                  {member.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </div>
                <span className="text-[14px] text-gray-700">{member.name}</span>
              </div>
            ))}

            {/* Expand/Collapse Button */}
            {hasMoreMembers && (
              <button
                onClick={() => setShowAllMembers(!showAllMembers)}
                className="w-full p-2 text-[14px] text-[#4F46E5] hover:bg-blue-50 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
              >
                {showAllMembers ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show {team.teamMembers.length - 3} More Members
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Edit Team Form Component - Standalone (Not Nested)
function EditTeamForm({ team, onClose }: { team: any; onClose: () => void }) {
  return <AddNewTeamForm onClose={onClose} initialData={team} isEdit={true} />;
}
