"use client";

import React, { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UnifiedTable } from '@/components/core';
import { PermissionGate } from '@/components/common/PermissionGate';
import {
  useTeamsQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useTableStateSync,
} from '@/hooks/useIntegratedQuery';
import { useAuth, useUI } from '@/stores';
import { ColumnDef } from '@tanstack/react-table';
import { exportToCSV } from '@/lib/utils/export';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { AddNewTeamForm } from './AddNewTeamForm';

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

  // Mutations
  const createTeamMutation = useCreateTeamMutation();
  const updateTeamMutation = useUpdateTeamMutation();
  const deleteTeamMutation = useDeleteTeamMutation();

  const [selectedTeams, setSelectedTeams] = useState<UiTeam[]>([]);

  const teams: UiTeam[] = React.useMemo(() => (teamsData?.data ?? []) as any, [teamsData]);

  // ------------------- Columns -------------------
  const columns: ColumnDef<UiTeam>[] = [
    {
      id: 'name',
      header: 'Team Name',
      cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.name}</span>,
    },
    {
      id: 'team_lead',
      header: 'Team Lead',
      cell: ({ row }) => <span className="text-gray-700">{row.original.team_lead?.username || row.original.team_lead?.full_name || '—'}</span>,
    },
    {
      id: 'members',
      header: 'Members',
      cell: ({ row }) => <span className="text-gray-700">{row.original.members.length}</span>,
    },
    {
      id: 'projects',
      header: 'Projects',
      cell: ({ row }) => <span className="text-gray-700">{row.original.projects?.length ?? 0}</span>,
    },
    {
      id: 'created',
      header: 'Created',
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <PermissionGate requiredPermissions={['create:teams']}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditTeam(row.original)}>
                Edit Team
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTeam(row.original)}>
                Delete Team
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </PermissionGate>
      ),
    },
  ];

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

  const handleEditTeam = (team: UiTeam) => {
    openModal({
      component: AddNewTeamForm,
      props: {
        initialData: team,
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

  const handleDeleteTeam = async (team: UiTeam) => {
    if (!confirm(`Delete team "${team.name}"?`)) return;
    try {
      await deleteTeamMutation.mutateAsync(team.id);
    } catch (err) {/* notifications handled in hook */}
  };

  const handleBulkExport = () => {
    if (selectedTeams.length === 0) return;
    exportToCSV('selected_teams.csv', selectedTeams);
  };

  // ------------------- Derived -------------------
  const filteredTeams = React.useMemo(() => {
    if (!tableState.search) return teams;
    const q = tableState.search.toLowerCase();
    return teams.filter(t => t.name.toLowerCase().includes(q) || t.team_lead?.full_name.toLowerCase().includes(q));
  }, [teams, tableState.search]);

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
        <PermissionGate requiredPermissions={['create:teams']}>
          <Button onClick={handleCreateTeam}>
            <Plus className="h-4 w-4 mr-2" /> Add Team
          </Button>
        </PermissionGate>
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
            {selectedTeams.length > 0 && (
              <Button variant="outline" onClick={handleBulkExport}>Export ({selectedTeams.length})</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <UnifiedTable
            data={filteredTeams}
            columns={columns as ColumnDef<unknown>[]}
            loading={isLoading}
            error={error?.message}
            onRowSelect={(rows) => setSelectedTeams(rows as UiTeam[])}
            onRefresh={refetch}
            config={{
              features: { pagination: true, sorting: true, selection: true, export: true, refresh: true, globalSearch: false },
              pagination: {
                pageSize: tableState.pageSize,
                page: tableState.page,
                total: teamsData?.pagination.total,
                onPageChange: setPage,
                onPageSizeChange: setPageSize,
              },
              styling: { variant: 'professional', size: 'md' },
              messages: { empty: 'No teams found.', loading: 'Loading teams...' },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
} 