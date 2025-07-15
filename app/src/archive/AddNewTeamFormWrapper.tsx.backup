"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, X } from "lucide-react";
import { useCreateTeamMutation, useUsersQuery } from "@/hooks/useIntegratedQuery";
import { useAuth, useUI } from "@/stores";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface UserOption {
  id: number;
  name: string;
  email: string;
  role?: string;
}

const formSchema = z.object({
  teamName: z.string().min(1, "Team name is required"),
  teamLead: z.string().min(1, "Team lead is required"),
  teamMembers: z.array(z.string()).min(1, "At least one team member is required"),
  assignedProject: z.string().optional(),
  contactNumber: z.string().optional(),
});

interface Project {
  id: number;
  name: string;
}

interface AddNewTeamFormWrapperProps {
  onClose: () => void;
  onFormSubmit?: () => void;
  initialData?: any;
  isEdit?: boolean;
}

export function AddNewTeamFormWrapper({ onClose, onFormSubmit, initialData, isEdit = false }: AddNewTeamFormWrapperProps) {
  const { user } = useAuth();
  const { addNotification } = useUI();

  const { data: usersData, isLoading: usersLoading } = useUsersQuery();
  console.log('[AddNewTeamFormWrapper] Data received from useUsersQuery:', usersData);
  console.log('[AddNewTeamFormWrapper] Users loading state:', usersLoading);

  const users: any[] = React.useMemo(() => {
    if (!usersData) return [];
    const d: any = usersData;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d.results)) return d.results;
    if (Array.isArray(d.data)) return d.data;
    return [];
  }, [usersData]);

  const [projects, setProjects] = React.useState<{ id: number; name: string }[]>([]);
  const [projectsLoading, setProjectsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProjects = async () => {
      console.log('[AddNewTeamFormWrapper] Fetching projects...');
      const token = localStorage.getItem("authToken");
      console.log('[AddNewTeamFormWrapper] Auth token for projects fetch:', token ? 'Found' : 'Missing');
      if (!token) {
        setProjectsLoading(false);
        return;
      }
      try {
        const response = await fetch("http://localhost:8000/api/v1/projects/", {
          headers: { Authorization: `Token ${token}` },
        });
        console.log('[AddNewTeamFormWrapper] Raw projects response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('[AddNewTeamFormWrapper] Raw projects data:', data);
          const list = Array.isArray(data)
            ? data
            : Array.isArray(data.results)
            ? data.results
            : [];
          setProjects(list);
        } else {
          console.error("Failed to fetch projects with status:", response.status);
          setProjects([]);
        }
      } catch (e) {
        console.error("Failed to fetch projects", e);
        setProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Create team mutation
  const createTeamMutation = useCreateTeamMutation();

  // Filter users based on their roles
  const extractRoleName = (u: any) => (typeof u.role === 'string' ? u.role : u.role?.name || '');

  const teamLeads = users.filter((u: any) => {
    const roleName = extractRoleName(u).toLowerCase();
    return ['supervisor', 'teamlead', 'team lead', 'org-admin', 'super-admin'].some(r => roleName.includes(r));
  }).map((u: any) => ({
    ...u,
    displayName: `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || u.name || u.username,
  }));

  const teamMembers = users.filter((u: any) => {
    const roleName = extractRoleName(u).toLowerCase();
    return !['super-admin', 'org-admin'].includes(roleName);
  }).map((u: any) => ({
    ...u,
    displayName: `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || u.name || u.username,
  }));

  // Debug logs (can be removed in production)
  React.useEffect(() => {
    console.log('=== DROPDOWN DEBUG INFO ===');
    console.log('Users state:', users);
    console.log('Team leads filtered:', teamLeads);
    console.log('Team members filtered:', teamMembers);
    console.log('Users loading:', usersLoading);
  }, [users, teamLeads, teamMembers, usersLoading]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamName: initialData?.teamName || "",
      teamLead: initialData?.teamLead || "",
      teamMembers: initialData?.teamMembers?.map((m: any) => `${m.id}-${m.name}`) || [],
      assignedProject: initialData?.assignedProjects || "",
      contactNumber: initialData?.contactNumber || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Resolve organization ID (supports multiple possible field names)
      const orgId = (user as any)?.organizationId ?? (user as any)?.organization ?? (user as any)?.organization_id;

      // Extract IDs from form values
      const teamLeadId = parseInt(values.teamLead.split('-')[0], 10);
      const teamMemberIds = values.teamMembers.map(member => parseInt(member.split('-')[0], 10));

      // Prepare team data for backend
      const teamData: any = {
        name: values.teamName,
        contact_number: values.contactNumber,
        team_lead_id: teamLeadId,
        member_ids: teamMemberIds,
      } as Record<string, any>;

      if (orgId) {
        teamData.organization = orgId;
      }

      if (values.assignedProject) {
        teamData.projects = [parseInt(values.assignedProject, 10)];
      }

      // Use the create mutation (note: update mutation would need to be added to integrated hooks)
      if (isEdit) {
        addNotification({
          type: 'warning',
          title: 'Edit not implemented',
          message: 'Team editing functionality needs to be implemented.',
        });
        return;
      }

      console.log('=== SUBMITTING TEAM DATA ===');
      console.log('Team data being sent:', teamData);
      
      await createTeamMutation.mutateAsync(teamData);

      // Success handling is done in the mutation hook
      form.reset();
      
      // Trigger custom event for parent component to refresh data
      console.log('=== DISPATCHING TEAM CREATED EVENT ===');
      window.dispatchEvent(new CustomEvent('teamCreated'));
      
      if (onFormSubmit) {
        onFormSubmit();
      }
      onClose();
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error(`Error ${isEdit ? 'updating' : 'creating'} team:`, error);
    }
  };

  // Combined loading state from mutations
  const isLoading = createTeamMutation.isPending;

  const handleClear = () => {
    if (!isLoading) {
      form.reset();
      addNotification({
        type: 'info',
        title: 'Form cleared',
        message: 'All form fields have been reset.',
      });
    }
  };

  const selectedMembers = form.watch("teamMembers") || [];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Exact Figma Header */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-semibold text-[#22C55E]">
            {isEdit ? "Edit Team" : "Add New Team"}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-[14px] text-gray-500 mt-2">
          {isEdit ? "Edit Information" : "Add Information"}
        </p>
      </div>

      {/* Form Body - Exact Figma Layout */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Team Name */}
            <FormField
              control={form.control}
              name="teamName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                    Team Name<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      className="h-[48px] border-gray-300 focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-lg" 
                      placeholder="Sales Person Name" 
                      {...field} 
                      disabled={isLoading} 
                    />
                  </FormControl>
                  <FormMessage className="text-[12px] text-red-500 mt-1" />
                </FormItem>
              )}
            />

            {/* Team Lead */}
            <FormField
              control={form.control}
              name="teamLead"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                    Team Lead<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading || usersLoading}>
                    <FormControl>
                      <SelectTrigger className="w-full h-[48px] border-gray-300 focus:border-[#4F46E5] text-[16px] rounded-lg">
                        <SelectValue placeholder={usersLoading ? "Loading users..." : "Select team lead"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {usersLoading ? (
                        <div className="px-2 py-1 text-sm text-gray-500">Loading users...</div>
                      ) : teamLeads.length > 0 ? (
                        teamLeads.map((lead) => (
                          <SelectItem key={lead.id} value={`${lead.id}-${lead.displayName}`}>
                            {lead.displayName} ({extractRoleName(lead)})
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1 text-sm text-gray-500">No team leads available</div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[12px] text-red-500 mt-1" />
                </FormItem>
              )}
            />

            {/* Team Members - Multi-select with Checkboxes */}
            <FormField
              control={form.control}
              name="teamMembers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                    Team Members<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <div className="border border-gray-300 rounded-lg p-3 bg-white min-h-[48px] max-h-[200px] overflow-y-auto">
                    {usersLoading ? (
                      <div className="text-sm text-gray-500">Loading users...</div>
                    ) : teamMembers.length > 0 ? (
                      <div className="space-y-2">
                        {teamMembers.map((member) => {
                          const memberValue = `${member.id}-${member.displayName}`;
                          const isSelected = field.value?.includes(memberValue);
                          return (
                            <div key={member.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md">
                              <Checkbox
                                id={`member-${member.id}`}
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentValue, memberValue]);
                                  } else {
                                    field.onChange(currentValue.filter((v: string) => v !== memberValue));
                                  }
                                }}
                                disabled={isLoading}
                              />
                              <div className="flex items-center gap-3 flex-1">
                                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[12px] font-medium">
                                  {member.displayName.split(' ').map((n:any) => n[0]).join('').toUpperCase()}
                                </div>
                                <span className="text-sm">{member.displayName} ({extractRoleName(member)})</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No team members available</div>
                    )}
                  </div>
                  {selectedMembers.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected: {selectedMembers.length} member{selectedMembers.length > 1 ? 's' : ''}
                    </div>
                  )}
                  <FormMessage className="text-[12px] text-red-500 mt-1" />
                </FormItem>
              )}
            />

            {/* Assigned Project */}
            <FormField
              control={form.control}
              name="assignedProject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                    Assigned Project <span className="text-gray-400 text-[12px]">(Optional)</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading || projectsLoading}>
                    <FormControl>
                      <SelectTrigger className="w-full h-[48px] border-gray-300 focus:border-[#4F46E5] text-[16px] rounded-lg">
                        <SelectValue placeholder={projectsLoading ? "Loading projects..." : "Select a project (optional)"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projects.length > 0 ? (
                        projects.map((project) => (
                          <SelectItem key={project.id} value={String(project.id)}>
                            {project.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1 text-sm text-gray-500">
                          {projectsLoading ? "Loading..." : "No projects available"}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[12px] text-red-500 mt-1" />
                </FormItem>
              )}
            />

            {/* Contact Number */}
            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">Contact Number (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. +1 234 567 890" 
                      {...field}
                      value={field.value || ""}
                      className="h-[48px] border-gray-300 focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-lg"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-[12px] text-red-500 mt-1" />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>

      {/* Exact Figma Footer Buttons */}
      <div className="px-8 py-4 border-t border-gray-100 bg-gray-50">
        <div className="flex justify-end items-center space-x-3">
          <Button
            type="button"
            variant="outline"
            className="h-[48px] px-6 text-[16px] font-semibold text-gray-700 border-gray-300 hover:bg-gray-100"
            onClick={handleClear}
            disabled={isLoading}
          >
            Clear
          </Button>
          <Button
            type="submit"
            className="h-[48px] px-6 text-[16px] font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white"
            disabled={isLoading}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              isEdit ? "Update Team" : "Save Team"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 