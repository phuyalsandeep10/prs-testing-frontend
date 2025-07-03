"use client";

<<<<<<< HEAD
import React, { useState, useEffect, useMemo } from "react";
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
import { createPortal } from "react-dom";
=======
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Eye, Edit, Trash2, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserTable } from '@/components/dashboard/org-admin/manage-users/UserTable';
import { TeamsTable } from '@/components/dashboard/org-admin/manage-teams/TeamsTable';
import { AddNewUserForm } from '@/components/dashboard/org-admin/manage-users/AddNewUserForm';
import { AddNewTeamForm } from '@/components/dashboard/org-admin/manage-teams/AddNewTeamForm';
import { createPortal } from 'react-dom';
import { toast } from "sonner";
>>>>>>> 88d5680dfbe26cde199938a510b8c65c45e12f46

type TabType = "users" | "team";
type ModalType =
  | "add-user"
  | "add-team"
  | "edit-team"
  | "view-team"
  | "edit-user"
  | "view-user"
  | null;

<<<<<<< HEAD
// Sample team data matching your Figma design
const sampleTeams = [
  {
    id: "1",
    teamName: "Design Wizards",
    teamLead: "Yubesh Koirala",
    contactNumber: "+977 - 9876543210",
    teamMembers: [
      { id: "1", name: "Carla Johnson", avatar: "/avatars/carla.jpg" },
      { id: "2", name: "Yubesh Parsad Koirala", avatar: "/avatars/yubesh.jpg" },
      { id: "3", name: "Sandesh Dhungana", avatar: "/avatars/sandesh.jpg" },
      { id: "4", name: "John Doe", avatar: "/avatars/john.jpg" },
    ],
    assignedProjects: "Peek Word Landing Page",
    extraProjectsCount: 0,
  },
  {
    id: "2",
    teamName: "Team SEO Warriors",
    teamLead: "Pooja Budhathoki",
    contactNumber: "+977 - 9876543210",
    teamMembers: [
      { id: "1", name: "Member 1", avatar: "/avatars/m1.jpg" },
      { id: "2", name: "Member 2", avatar: "/avatars/m2.jpg" },
      { id: "3", name: "Member 3", avatar: "/avatars/m3.jpg" },
      { id: "4", name: "Member 4", avatar: "/avatars/m4.jpg" },
      { id: "5", name: "Member 5", avatar: "/avatars/m5.jpg" },
    ],
    assignedProjects: "SEO & SEM, Traffic boost",
    extraProjectsCount: 1,
  },
];

// Sample user data matching UserTableData type (User + fullName)
const sampleUsers = [
  {
    id: "1",
    name: "Yubesh Parsad Koirala",
    fullName: "Yubesh Parsad Koirala",
    email: "yubeshkoirala@gmail.com",
    phoneNumber: "+977 - 9876543210",
    role: "team-member" as const,
    assignedTeam: "Design Wizards",
    status: "active" as const,
  },
  {
    id: "2",
    name: "Abinash Babu Tiwari",
    fullName: "Abinash Babu Tiwari",
    email: "tiwariabinash@gmail.com",
    phoneNumber: "+977 - 9876543210",
    role: "salesperson" as const,
    assignedTeam: "Team SEO Warriors",
    status: "active" as const,
  },
  {
    id: "3",
    name: "Lalit Rai",
    fullName: "Lalit Rai",
    email: "railalit@gmail.com",
    phoneNumber: "+977 - 9876543210",
    role: "org-admin" as const,
    assignedTeam: "Sales Giants",
    status: "inactive" as const,
  },
];
=======
// Type definitions for API data
interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_number?: string;
  role?: {
    id: number;
    name: string;
  };
  organization: number;
  teams?: number[];
  is_active: boolean;
  date_joined: string;
}

interface Team {
  id: number;
  name: string;
  organization: number;
  team_lead: number | null; // The ID of the team lead
  members: number[];
  projects: number[];
  contact_number?: string;
  created_at: string;
  
  // Nested details from the API
  team_lead_details?: {
    id: number;
    first_name: string;
    last_name: string;
  };
  members_details?: {
    id: number;
    first_name: string;
    last_name: string;
  }[];
  projects_details?: {
    id: number;
    name: string;
  }[];
}
>>>>>>> 88d5680dfbe26cde199938a510b8c65c45e12f46

export default function ManageUsersPage() {
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Real data state
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Load users from API
  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/auth/users/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const usersList = Array.isArray(data) ? data : data.results || [];
        setUsers(usersList);
      } else {
        console.error('Failed to load users:', response.status);
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Network error loading users');
    }
  };

  // Load teams from API
  const loadTeams = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        return;
      }

      const response = await fetch('http://localhost:8000/api/v1/teams/', {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const teamsList = Array.isArray(data) ? data : data.results || [];
        setTeams(teamsList);
      } else {
        console.error('Failed to load teams:', response.status);
        toast.error('Failed to load teams');
      }
    } catch (error) {
      console.error('Error loading teams:', error);
      toast.error('Network error loading teams');
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadUsers(), loadTeams()]);
      setLoading(false);
    };
    
    loadData();

    // Listen for user and team creation/update events
    const handleUserCreated = () => {
      toast.success('User list updated');
      loadUsers();
    };

    const handleUserUpdated = () => {
      toast.success('User updated successfully');
      loadUsers();
    };

    const handleTeamCreated = async () => {
      toast.success('Team list updated');
      await Promise.all([loadTeams(), loadUsers()]);
    };

    const handleTeamUpdated = async () => {
      toast.success('Team updated successfully');
      await Promise.all([loadTeams(), loadUsers()]);
    };

    window.addEventListener('userCreated', handleUserCreated);
    window.addEventListener('userUpdated', handleUserUpdated);
    window.addEventListener('teamCreated', handleTeamCreated);
    window.addEventListener('teamUpdated', handleTeamUpdated);

    return () => {
      window.removeEventListener('userCreated', handleUserCreated);
      window.removeEventListener('userUpdated', handleUserUpdated);
      window.removeEventListener('teamCreated', handleTeamCreated);
      window.removeEventListener('teamUpdated', handleTeamUpdated);
    };
  }, []);

  console.log("model view", openModal);
  // Global search function for users
  const searchAllUserColumns = (user: User, query: string): boolean => {
    const searchableFields = [
      `${user.first_name} ${user.last_name}`,
      user.email,
<<<<<<< HEAD
      user.phoneNumber,
      user.assignedTeam,
      user.status,
=======
      user.contact_number || '',
      user.role?.name || '',
      user.is_active ? 'active' : 'inactive'
>>>>>>> 88d5680dfbe26cde199938a510b8c65c45e12f46
    ];

    return searchableFields.some((field) =>
      field.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Global search function for teams
  const searchAllTeamColumns = (team: Team, query: string): boolean => {
    const searchableFields = [
<<<<<<< HEAD
      team.teamName,
      team.teamLead,
      team.contactNumber,
      team.assignedProjects,
      team.teamMembers.map((member: any) => member.name).join(" "),
=======
      team.name,
      team.team_lead_details ? `${team.team_lead_details.first_name} ${team.team_lead_details.last_name}` : '',
      team.contact_number || '',
      ...(team.members_details?.map(m => `${m.first_name} ${m.last_name}`) || []),
      ...(team.projects_details?.map(p => p.name) || [])
>>>>>>> 88d5680dfbe26cde199938a510b8c65c45e12f46
    ];

    return searchableFields.some((field) =>
      field.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Filter data based on search query
  useEffect(() => {
    if (searchTerm.trim()) {
<<<<<<< HEAD
      const filteredUserData = sampleUsers.filter((user) =>
        searchAllUserColumns(user, searchTerm)
      );
      const filteredTeamData = sampleTeams.filter((team) =>
=======
      const filteredUserData = users.filter(user => 
        searchAllUserColumns(user, searchTerm)
      );
      const filteredTeamData = teams.filter(team => 
>>>>>>> 88d5680dfbe26cde199938a510b8c65c45e12f46
        searchAllTeamColumns(team, searchTerm)
      );
      setFilteredUsers(filteredUserData);
      setFilteredTeams(filteredTeamData);
    } else {
      setFilteredUsers(users);
      setFilteredTeams(teams);
    }
  }, [searchTerm, users, teams]);

  // Transform API data to table format
  const transformUsersForTable = (users: User[]) => {
    return users.map(user => {
      const teamNames = Array.isArray(user.teams) && user.teams.length > 0
        ? user.teams.map((t: any) => t.name).join(', ')
        : 'Not Assigned';

      return {
        id: user.id.toString(),
        name: `${user.first_name} ${user.last_name}`.trim() || user.username,
        fullName: `${user.first_name} ${user.last_name}`.trim() || user.username,
        email: user.email,
        phoneNumber: user.contact_number || 'N/A',
        role: (user.role?.name ? user.role.name.toLowerCase().replace(/[\s-]+/g, '-') : 'user') as any,
        assignedTeam: teamNames,
        status: user.is_active ? ('active' as const) : ('inactive' as const),
      };
    });
  };

  const transformTeamsForTable = (teams: Team[]) => {
    console.log('Raw teams data from API:', teams); // DEBUG: Log raw data
    
    const transformed = teams.map(team => {
      const transformedTeam = {
        id: team.id.toString(),
        teamName: team.name,
        teamLead: team.team_lead_details ? `${team.team_lead_details.first_name} ${team.team_lead_details.last_name}`.trim() : 'No Lead',
        contactNumber: team.contact_number || 'N/A',
        teamMembers: team.members_details?.map(m => ({
          id: m.id.toString(),
          name: `${m.first_name} ${m.last_name}`,
          avatar: `https://ui-avatars.com/api/?name=${m.first_name}+${m.last_name}&background=random`
        })) || [],
        assignedProjects: team.projects_details?.map(p => p.name).join(', ') || 'No projects',
        extraProjectsCount: team.projects_details && team.projects_details.length > 1 ? team.projects_details.length - 1 : 0
      };
      console.log('Transformed team for table:', transformedTeam); // DEBUG: Log transformed data
      return transformedTeam;
    });

    return transformed;
  };

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
<<<<<<< HEAD

        {activeTab === "users" ? (
          <UserTable
            data={filteredUsers}
            onView={handleViewUser}
            onEdit={handleEditUser}
            onDelete={(user) => console.log("Delete user:", user)}
          />
        ) : (
          <TeamsTable
            data={filteredTeams}
            onView={handleViewTeam}
            onEdit={handleEditTeam}
            onDelete={(team) => console.log("Delete team:", team)}
          />
=======
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4F46E5] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading {activeTab === 'users' ? 'users' : 'teams'}...</p>
            </div>
          </div>
        ) : activeTab === 'users' ? (
          filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No users found</p>
              <p className="text-gray-500 mb-4">Start by creating your first user.</p>
              <Button 
                onClick={() => setOpenModal('add-user')}
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white"
              >
                Add First User
              </Button>
            </div>
          ) : (
            <UserTable 
              data={transformUsersForTable(filteredUsers)}
              onView={handleViewUser}
              onEdit={handleEditUser}
              onDelete={(user) => console.log('Delete user:', user)}
            />
          )
        ) : (
          filteredTeams.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No teams found</p>
              <p className="text-gray-500 mb-4">Start by creating your first team.</p>
              <Button 
                onClick={() => setOpenModal('add-team')}
                className="bg-[#4F46E5] hover:bg-[#4338CA] text-white"
              >
                Add First Team
              </Button>
            </div>
          ) : (
            <TeamsTable 
              data={transformTeamsForTable(filteredTeams)}
              onView={handleViewTeam}
              onEdit={handleEditTeam}
              onDelete={(team) => console.log('Delete team:', team)}
            />
          )
>>>>>>> 88d5680dfbe26cde199938a510b8c65c45e12f46
        )}
      </div>

      {/* Modal Overlay - Rendered at document.body level using Portal */}
      {openModal &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0, 
              bottom: 0,
              zIndex: 99999,
            }}
          >
            {/* Full Screen Backdrop */}
            <div
              className="absolute inset-0 w-full h-full bg-black animate-fadeInCenter"
              onClick={handleCloseModal}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
            />

            {/* Modal Content */}
            {openModal === "view-team" || openModal === "view-user" ? (
              /* Centered Card Modals */
              <div className="relative z-[100000] flex items-center justify-center w-full h-full p-4 pointer-events-none">
                <div
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all pointer-events-auto"
                  style={{ zIndex: 100000 }}
                >
                  {openModal === "view-team" && selectedTeam && (
                    <TeamDetailView
                      team={selectedTeam}
                      onClose={handleCloseModal}
                    />
                  )}
                  {openModal === "view-user" && selectedUser && (
                    <UserDetailView
                      user={selectedUser}
                      onClose={handleCloseModal}
                    />
                  )}
                </div>
              </div>
            ) : (
              /* Right Side Form Modals */
              <div
                className={`${
                  openModal === "add-user"
                    ? "animate-fadeInSide "
                    : "animate-fadeInSide"
                } fixed top-0 right-0 h-full w-[384px] bg-white shadow-2xl z-[100000] `}
                style={{
                  position: "fixed",
                  top: 0,
                  right: 0,
                  height: "100vh",
                  zIndex: 100000,
                }}
              >
                {openModal === "add-user" && (
                  <AddNewUserForm onClose={handleCloseModal} />
                )}
                {openModal === "add-team" && (
                  <AddNewTeamForm onClose={handleCloseModal} />
                )}
                {openModal === "edit-team" && selectedTeam && (
                  <EditTeamForm
                    team={selectedTeam}
                    onClose={handleCloseModal}
                  />
                )}
                {openModal === "edit-user" && selectedUser && (
                  <EditUserForm
                    user={selectedUser}
                    onClose={handleCloseModal}
                  />
                )}
              </div>
            )}
          </div>,
          document.body
        )}
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
