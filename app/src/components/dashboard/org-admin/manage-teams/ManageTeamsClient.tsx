"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TeamsTable } from './TeamsTable';
import { PermissionGate } from '@/components/common/PermissionGate';
import {
  useTeamsQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useTableStateSync,
} from '@/hooks/useIntegratedQuery';
import { useProjects } from '@/hooks/api';
import { useAuth, useUI } from '@/stores';
import { AddNewTeamForm } from './AddNewTeamForm';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// ------------------- Types -------------------
interface UiTeam {
  id: string;
  name: string;
  team_lead: {
    id: string;
    full_name: string;
    username: string;
  } | null;
  members: {
    id: string;
    full_name: string;
  }[];
  contact_number?: string;
  projects?: { id: string; name: string }[];
  created_at: string;
}

// Team data type matching TeamsTable component interface
interface TransformedTeam {
  id: string;
  teamName: string;
  teamLead: string;
  contactNumber: string;
  teamMembers: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  assignedProjects: string;
  extraProjectsCount?: number;
}

export function ManageTeamsClient() {
  const { user } = useAuth();
  const { addNotification, openModal, closeModal } = useUI();

  // Table state with URL sync
  const {
    tableState,
    setSearch,
    setPage,
    setPageSize,
    setFilters,
    resetFilters,
  } = useTableStateSync('teams-table');

  // Data query
  const {
    data: teamsData,
    isLoading,
    error,
    refetch,
  } = useTeamsQuery(tableState);

  // Get projects for mapping
  const orgIdNum = user?.organizationId ? parseInt(user.organizationId, 10) : undefined;
  const { data: projects = [] } = useProjects(orgIdNum);

  // Mutations
  const createTeamMutation = useCreateTeamMutation();
  const updateTeamMutation = useUpdateTeamMutation();
  const deleteTeamMutation = useDeleteTeamMutation();



  const teams: UiTeam[] = React.useMemo(() => (teamsData?.data ?? []) as any, [teamsData]);

  // Transform API data to match TeamsTable component interface
  const transformTeamsForTable = useCallback((teams: UiTeam[]): TransformedTeam[] => {
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
          ? team.team_lead.full_name || team.team_lead.username || "Unknown Lead"
          : "No Lead",
        contactNumber: team.contact_number || "N/A",
        teamMembers:
          team.members?.map((m) => ({
            id: m.id.toString(),
            name: m.full_name || "Unknown Member",
            avatar: `https://ui-avatars.com/api/?name=${m.full_name}&background=random`,
          })) || [],
        assignedProjects:
          team.projects?.map((project) => project.name).join(", ") || "No projects",
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

  // Transform teams for table display
  const transformedTeams = useMemo(() => {
    return transformTeamsForTable(teams);
  }, [teams, transformTeamsForTable]);

  // Lightweight debug to verify data flow – remove or comment in production
  useEffect(() => {
    console.log('[TEAMS_TABLE_DEBUG] raw teamsData ->', teamsData);
    console.log('[TEAMS_TABLE_DEBUG] derived teams[] ->', teams);
    console.log('[TEAMS_TABLE_DEBUG] transformed teams[] ->', transformedTeams);
  }, [teamsData, teams, transformedTeams]);

  // ------------------- Handlers -------------------

  // ------------------- Handlers -------------------
  const handleCreateTeam = () => {
    openModal({
      component: AddNewTeamForm,
      props: {
        onClose: closeModal,
        onFormSubmit: () => {
          refetch();
          addNotification({ type: 'success', title: 'Team created', message: 'New team added.' });
        },
      },
      options: { size: 'lg' },
    });
  };

  const handleEditTeam = (team: TransformedTeam) => {
    // Find the original team data for editing
    const originalTeam = teams.find(t => t.id === team.id);
    if (!originalTeam) return;
    
    openModal({
      component: AddNewTeamForm,
      props: {
        initialData: originalTeam,
        isEdit: true,
        onClose: closeModal,
        onFormSubmit: () => {
          refetch();
          addNotification({ type: 'success', title: 'Team updated', message: 'Team details updated.' });
        },
      },
      options: { size: 'lg' },
    });
  };

  const handleDeleteTeam = async (team: TransformedTeam) => {
    if (!confirm(`Delete team "${team.teamName}"?`)) return;
    try {
      await deleteTeamMutation.mutateAsync(team.id);
    } catch (err) {/* notifications handled in hook */}
  };



  // ------------------- Derived -------------------
  const filteredTransformedTeams = React.useMemo(() => {
    if (!tableState.search) return transformedTeams;
    const q = tableState.search.toLowerCase();
    return transformedTeams.filter(t => 
      t.teamName.toLowerCase().includes(q) || 
      t.teamLead.toLowerCase().includes(q)
    );
  }, [transformedTeams, tableState.search]);

  // Simple metrics
  const totalTeams = teamsData?.pagination.total || 0;
  const totalMembers = teams.reduce((acc, t) => acc + t.members.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Teams</h1>
          <p className="text-gray-600">Create and manage teams in your organization</p>
        </div>
        <ErrorBoundary fallback={<div className="text-red-600">You do not have permission to add a team.</div>}>
          <PermissionGate requiredPermissions={['create:teams']}>
            <Button onClick={handleCreateTeam}>
              <Plus className="h-4 w-4 mr-2" /> Add Team
            </Button>
          </PermissionGate>
        </ErrorBoundary>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="flex items-center p-6 gap-4">
            <Badge variant="secondary">Teams</Badge>
            <span className="text-2xl font-bold">{totalTeams}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center p-6 gap-4">
            <Badge variant="secondary">Total Members</Badge>
            <span className="text-2xl font-bold">{totalMembers}</span>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input className="pl-10" placeholder="Search teams..." value={tableState.search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Button variant="outline" onClick={resetFilters}>
              <Filter className="h-4 w-4 mr-2" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">Loading teams...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">Error loading teams: {error.message}</p>
            </div>
          ) : filteredTransformedTeams.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No teams found.</p>
            </div>
          ) : (
            <TeamsTable
              data={filteredTransformedTeams}
              onEdit={handleEditTeam}
              onDelete={handleDeleteTeam}
              pagination={{
                page: tableState.page,
                pageSize: tableState.pageSize,
                total: teamsData?.pagination.total || 0,
                onPageChange: setPage,
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 