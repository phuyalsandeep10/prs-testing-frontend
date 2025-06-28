"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserTable } from '@/components/dashboard/org-admin/manage-users/UserTable';
import { TeamsTable } from '@/components/dashboard/org-admin/manage-teams/TeamsTable';
import { AddNewUserForm } from '@/components/dashboard/org-admin/manage-users/AddNewUserForm';
import { AddNewTeamForm } from '@/components/dashboard/org-admin/manage-teams/AddNewTeamForm';

type TabType = 'users' | 'team';
type ModalType = 'add-user' | 'add-team' | 'edit-team' | 'view-team' | 'edit-user' | 'view-user' | null;

// Sample team data matching your Figma design
const sampleTeams = [
  {
    id: '1',
    teamName: 'Design Wizards',
    teamLead: 'Yubesh Koirala',
    contactNumber: '+977 - 9876543210',
    teamMembers: [
      { id: '1', name: 'Carla Johnson', avatar: '/avatars/carla.jpg' },
      { id: '2', name: 'Yubesh Parsad Koirala', avatar: '/avatars/yubesh.jpg' },
      { id: '3', name: 'Sandesh Dhungana', avatar: '/avatars/sandesh.jpg' },
      { id: '4', name: 'John Doe', avatar: '/avatars/john.jpg' },
    ],
    assignedProjects: 'Peek Word Landing Page',
    extraProjectsCount: 0,
  },
  {
    id: '2',
    teamName: 'Team SEO Warriors',
    teamLead: 'Pooja Budhathoki',
    contactNumber: '+977 - 9876543210',
    teamMembers: [
      { id: '1', name: 'Member 1', avatar: '/avatars/m1.jpg' },
      { id: '2', name: 'Member 2', avatar: '/avatars/m2.jpg' },
      { id: '3', name: 'Member 3', avatar: '/avatars/m3.jpg' },
      { id: '4', name: 'Member 4', avatar: '/avatars/m4.jpg' },
      { id: '5', name: 'Member 5', avatar: '/avatars/m5.jpg' },
    ],
    assignedProjects: 'SEO & SEM, Traffic boost',
    extraProjectsCount: 1,
  },
];

// Sample user data matching your Figma design
const sampleUsers = [
  {
    id: '1',
    fullName: 'Yubesh Parsad Koirala',
    email: 'yubeshkoirala@gmail.com',
    phoneNumber: '+977 - 9876543210',
    assignedTeam: 'Design Wizards',
    status: 'Active' as const,
  },
  {
    id: '2',
    fullName: 'Abinash Babu Tiwari',
    email: 'tiwariabinash@gmail.com',
    phoneNumber: '+977 - 9876543210',
    assignedTeam: 'Team SEO Warriors',
    status: 'Active' as const,
  },
  {
    id: '3',
    fullName: 'Lalit Rai',
    email: 'railalit@gmail.com',
    phoneNumber: '+977 - 9876543210',
    assignedTeam: 'Sales Giants',
    status: 'Inactive' as const,
  },
];

export default function ManageUsersPage() {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [filteredUsers, setFilteredUsers] = useState(sampleUsers);
  const [filteredTeams, setFilteredTeams] = useState(sampleTeams);

  // Global search function for users
  const searchAllUserColumns = (user: any, query: string): boolean => {
    const searchableFields = [
      user.fullName,
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
  const searchAllTeamColumns = (team: any, query: string): boolean => {
    const searchableFields = [
      team.teamName,
      team.teamLead,
      team.contactNumber,
      team.assignedProjects,
      team.teamMembers.map((member: any) => member.name).join(' ')
    ];

    return searchableFields.some(field => 
      field.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Filter data based on search query
  useEffect(() => {
    if (searchTerm.trim()) {
      const filteredUserData = sampleUsers.filter(user => 
        searchAllUserColumns(user, searchTerm)
      );
      const filteredTeamData = sampleTeams.filter(team => 
        searchAllTeamColumns(team, searchTerm)
      );
      setFilteredUsers(filteredUserData);
      setFilteredTeams(filteredTeamData);
    } else {
      setFilteredUsers(sampleUsers);
      setFilteredTeams(sampleTeams);
    }
  }, [searchTerm]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleViewTeam = (team: any) => {
    setSelectedTeam(team);
    setOpenModal('view-team');
  };

  const handleEditTeam = (team: any) => {
    setSelectedTeam(team);
    setOpenModal('edit-team');
  };

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setOpenModal('view-user');
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setOpenModal('edit-user');
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
              {activeTab === 'users' ? 'User Management' : 'Team Management'}
            </h1>
            <p className="text-[16px] text-gray-500 leading-relaxed">
              Manage your user base, teams and access all the details of each user.
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
              onClick={() => setOpenModal(activeTab === 'users' ? 'add-user' : 'add-team')}
              className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-6 py-3 h-[44px] rounded-lg font-medium text-[14px] flex items-center gap-2 transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" />
              {activeTab === 'users' ? 'Create User' : 'Create Team'}
            </Button>
          </div>
        </div>

        {/* Exact Figma Tabs Implementation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-12 -mb-px">
            <button
              onClick={() => handleTabChange('users')}
              className={`pb-4 px-1 text-[16px] font-medium transition-all relative ${
                activeTab === 'users'
                  ? 'text-[#4F46E5] border-b-2 border-[#4F46E5]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-[18px]">👤</span>
                Users
              </span>
            </button>
            <button
              onClick={() => handleTabChange('team')}
              className={`pb-4 px-1 text-[16px] font-medium transition-all relative ${
                activeTab === 'team'
                  ? 'text-[#4F46E5] border-b-2 border-[#4F46E5]'
                  : 'text-gray-500 hover:text-gray-700'
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
            {activeTab === 'users' 
              ? `Found ${filteredUsers.length} user(s) matching "${searchTerm}"`
              : `Found ${filteredTeams.length} team(s) matching "${searchTerm}"`
            }
          </div>
        )}
        
        {activeTab === 'users' ? (
          <UserTable 
            data={filteredUsers}
            onView={handleViewUser}
            onEdit={handleEditUser}
            onDelete={(user) => console.log('Delete user:', user)}
          />
        ) : (
          <TeamsTable 
            data={filteredTeams}
            onView={handleViewTeam}
            onEdit={handleEditTeam}
            onDelete={(team) => console.log('Delete team:', team)}
          />
        )}
      </div>

      {/* Modal Overlay - Exact Figma Card-Style Implementation */}
      {openModal && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" 
            onClick={handleCloseModal} 
          />
          
          {/* Modal Content - Centered Card Style for View/Detail Modals */}
          {(openModal === 'view-team' || openModal === 'view-user') ? (
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-scale-in">
                {openModal === 'view-team' && selectedTeam && (
                  <TeamDetailView team={selectedTeam} onClose={handleCloseModal} />
                )}
                {openModal === 'view-user' && selectedUser && (
                  <UserDetailView user={selectedUser} onClose={handleCloseModal} />
                )}
              </div>
            </div>
          ) : (
            /* Form Modals - Right Side Panel */
            <div className="fixed right-0 top-0 h-full w-[384px] bg-white shadow-2xl transform transition-transform animate-slide-in-right">
              {openModal === 'add-user' && (
                <AddNewUserForm onClose={handleCloseModal} />
              )}
              {openModal === 'add-team' && (
                <AddNewTeamForm onClose={handleCloseModal} />
              )}
              {openModal === 'edit-team' && selectedTeam && (
                <EditTeamForm team={selectedTeam} onClose={handleCloseModal} />
              )}
              {openModal === 'edit-user' && selectedUser && (
                <EditUserForm user={selectedUser} onClose={handleCloseModal} />
              )}
            </div>
          )}
        </div>
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
          <h2 className="text-[20px] font-semibold text-[#4F46E5]">{user.fullName}</h2>
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
            <h3 className="text-[14px] font-medium text-gray-900 mb-2">Contact Information</h3>
            <div className="space-y-1">
              <p className="text-[14px] text-gray-600">
                <span className="font-medium text-gray-900">Email:</span> {user.email}
              </p>
              <p className="text-[14px] text-gray-600">
                <span className="font-medium text-gray-900">Phone:</span> {user.phoneNumber}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <h3 className="text-[14px] font-medium text-gray-900 mb-2">Team Assignment</h3>
            <p className="text-[14px] text-gray-600">
              <span className="font-medium text-gray-900">Team:</span> {user.assignedTeam}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Edit User Form Component - Standalone (Not Nested)
function EditUserForm({ user, onClose }: { user: any; onClose: () => void }) {
  return (
    <AddNewUserForm onClose={onClose} initialData={user} isEdit={true} />
  );
}

// Team Detail View Component - Exact Figma Card Design
function TeamDetailView({ team, onClose }: { team: any; onClose: () => void }) {
  const [showAllMembers, setShowAllMembers] = React.useState(false);
  const displayMembers = showAllMembers ? team.teamMembers : team.teamMembers.slice(0, 3);
  const hasMoreMembers = team.teamMembers.length > 3;

  return (
    <div className="relative">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-semibold text-[#4F46E5]">{team.teamName}</h2>
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
            <span className="font-medium text-gray-900">Number of members:</span> {team.teamMembers.length}
          </p>
          <p className="text-[14px] text-gray-600">
            <span className="font-medium text-gray-900">Team Lead:</span> {team.teamLead}
          </p>
          <p className="text-[14px] text-gray-600">
            <span className="font-medium text-gray-900">Contact No:</span> {team.contactNumber.replace(' - ', '')}
          </p>
        </div>

        <div>
          <h3 className="text-[16px] font-medium text-gray-900 mb-3">Team Members</h3>
          <div className="space-y-2">
            {displayMembers.map((member: any) => (
              <div key={member.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[11px] font-medium">
                  {member.name.split(' ').map((n: string) => n[0]).join('')}
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
  return (
    <AddNewTeamForm onClose={onClose} initialData={team} isEdit={true} />
  );
}
