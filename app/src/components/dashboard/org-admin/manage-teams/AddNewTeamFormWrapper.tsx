"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, X } from "lucide-react";
import { useCreateTeamMutation, useUsersQuery } from "@/hooks/useIntegratedQuery";
import { useProjects } from "@/hooks/api";
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

interface AddNewTeamFormWrapperProps {
  onClose: () => void;
  onFormSubmit?: () => void;
  initialData?: any;
  isEdit?: boolean;
}

export function AddNewTeamFormWrapper({ 
  onClose, 
  onFormSubmit, 
  initialData, 
  isEdit = false 
}: AddNewTeamFormWrapperProps) {
  const { user } = useAuth();
  const { addNotification } = useUI();

  const { data: usersData, isLoading: usersLoading } = useUsersQuery();
  
  // Use standardized projects hook
  const { data: projects = [], isLoading: projectsLoading } = useProjects();

  console.log('[AddNewTeamFormWrapper] Data received from useUsersQuery:', usersData);
  console.log('[AddNewTeamFormWrapper] Users loading state:', usersLoading);
  console.log('[AddNewTeamFormWrapper] Projects from standardized hook:', projects);
  console.log('[AddNewTeamFormWrapper] Projects loading state:', projectsLoading);

  const users: any[] = React.useMemo(() => {
    if (!usersData) return [];
    const d: any = usersData;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d.results)) return d.results;
    if (Array.isArray(d.data)) return d.data;
    return [];
  }, [usersData]);

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
    console.log('Projects from hook:', projects);
    console.log('Projects loading:', projectsLoading);
  }, [users, teamLeads, teamMembers, usersLoading, projects, projectsLoading]);

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
  const isLoading = createTeamMutation.isPending || usersLoading || projectsLoading;

  const handleClear = () => {
    form.reset();
    console.log('Form cleared');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Team' : 'Add New Team'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Team Name */}
            <FormField
              control={form.control}
              name="teamName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter team name" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Team Lead */}
            <FormField
              control={form.control}
              name="teamLead"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Lead *</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team lead" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamLeads.map((lead) => (
                          <SelectItem key={lead.id} value={`${lead.id}-${lead.displayName}`}>
                            {lead.displayName} ({lead.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Team Members */}
            <FormField
              control={form.control}
              name="teamMembers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Members *</FormLabel>
                  <FormControl>
                    <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`member-${member.id}`}
                            checked={field.value.includes(`${member.id}-${member.displayName}`)}
                            onCheckedChange={(checked) => {
                              const memberValue = `${member.id}-${member.displayName}`;
                              if (checked) {
                                field.onChange([...field.value, memberValue]);
                              } else {
                                field.onChange(field.value.filter(v => v !== memberValue));
                              }
                            }}
                            disabled={isLoading}
                          />
                          <label 
                            htmlFor={`member-${member.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {member.displayName} ({member.email})
                          </label>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Assigned Project */}
            <FormField
              control={form.control}
              name="assignedProject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Project</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No project assigned</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id.toString()}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Number */}
            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter contact number" 
                      {...field} 
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                disabled={isLoading}
              >
                Clear
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEdit ? 'Update Team' : 'Create Team'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
