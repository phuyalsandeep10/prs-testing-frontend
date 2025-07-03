"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Interface for user data
interface UserOption {
  id: number;
  name: string;
  email: string;
  role?: string;
}

// Projects will be loaded from API

const formSchema = z.object({
  teamName: z.string().min(1, "Team name is required"),
  teamLead: z.string().min(1, "Team lead is required"),
  teamMember: z.string().min(1, "Team member is required"),
  assignedProject: z.string().optional(),
  contactNumber: z.string().optional(),
});

interface AddNewTeamFormProps {
  onClose: () => void;
  onFormSubmit?: () => void;
  initialData?: any;
  isEdit?: boolean;
}

export function AddNewTeamForm({ onClose, onFormSubmit, initialData, isEdit = false }: AddNewTeamFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [users, setUsers] = React.useState<UserOption[]>([]);
  const [usersLoading, setUsersLoading] = React.useState(true);
  const [projects, setProjects] = React.useState<{ id: number, name: string }[]>([]);
  const [projectsLoading, setProjectsLoading] = React.useState(true);

  // Filter users based on their roles
  const teamLeads = users.filter(user => 
    user.role === 'Supervisor/Team Lead' || 
    user.role === 'Org Admin' ||
    user.role === 'Super Admin'
  );
  const teamMembers = users.filter(user => 
    user.role && !['Super Admin', 'Org Admin'].includes(user.role)
  );

  // Debug logs (can be removed in production)
  React.useEffect(() => {
    console.log('=== DROPDOWN DEBUG INFO ===');
    console.log('Users state:', users);
    console.log('Team leads filtered:', teamLeads);
    console.log('Team members filtered:', teamMembers);
    console.log('Projects state:', projects);
    console.log('Users loading:', usersLoading);
    console.log('Projects loading:', projectsLoading);
    console.log('Auth token exists:', !!localStorage.getItem('authToken'));
  }, [users, teamLeads, teamMembers, projects, usersLoading, projectsLoading]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamName: initialData?.teamName || "",
      teamLead: initialData?.teamLead || "",
      teamMember: initialData?.teamMembers?.[0]?.name || "",
      assignedProject: initialData?.assignedProjects || "",
      contactNumber: initialData?.contactNumber || "",
    },
  });

  // Load users from API
  React.useEffect(() => {
    const loadUsers = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setUsersLoading(false);
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
          
          const mappedUsers = usersList.map((user: any) => ({
            id: user.id,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
            email: user.email,
            role: user.role?.name || 'User'
          }));
          
          const uniqueUsers = mappedUsers.filter((user, index, self) => 
            index === self.findIndex(u => u.id === user.id)
          );
          
          setUsers(uniqueUsers);
          console.log('Loaded users:', uniqueUsers); // Debug log
        } else {
          console.error('Failed to load users:', response.status);
        }
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setUsersLoading(false);
      }
    };

    const loadProjects = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setProjectsLoading(false);
          return;
        }

        const response = await fetch('http://localhost:8000/api/v1/projects/', {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const projectsList = Array.isArray(data) ? data : data.results || [];
          const projectOptions = projectsList.map((project: any) => ({ id: project.id, name: project.name }));
          setProjects(projectOptions);
          console.log('Loaded projects:', projectOptions); // Debug log
        } else {
          console.error('Failed to load projects:', response.status);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setProjectsLoading(false);
      }
    };

    loadUsers();
    loadProjects();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const userString = localStorage.getItem('user');

      if (!token || !userString) {
        toast.error('Authentication details not found. Please login again.');
        setIsLoading(false);
        return;
      }

      const currentUser = JSON.parse(userString);
      const organizationId = currentUser?.organization?.id;

      if (!organizationId) {
        toast.error('Could not determine your organization. Please login again.');
        setIsLoading(false);
        return;
      }

      // Extract IDs from form values
      const teamLeadId = parseInt(values.teamLead.split('-')[0], 10);
      const teamMemberIds = [parseInt(values.teamMember.split('-')[0], 10)];
      const projectIds = values.assignedProject ? [parseInt(values.assignedProject, 10)] : [];

      // Prepare team data in the format the backend expects
      const teamData: any = {
        name: values.teamName,
        organization: organizationId,
        contact_number: values.contactNumber,
        team_lead: teamLeadId,
        members: teamMemberIds,
      };

      if (projectIds.length > 0) {
        teamData.projects = projectIds;
      }

      console.log('Sending team data:', teamData);

      const url = isEdit 
        ? `http://localhost:8000/api/v1/teams/${initialData?.id}/`
        : 'http://localhost:8000/api/v1/teams/';
        
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      });

      const responseData = await response.json();
      console.log('API Response:', responseData);

      if (response.ok) {
        toast.success(`Team ${isEdit ? 'updated' : 'created'} successfully!`);
        
        // Trigger refresh events
        const event = new CustomEvent(isEdit ? 'teamUpdated' : 'teamCreated', {
          detail: responseData
        });
        window.dispatchEvent(event);
        
        form.reset();
        if (onFormSubmit) {
          onFormSubmit();
        }
        onClose();
      } else {
        const errorMessage = responseData.detail || 
                           responseData.message || 
                           Object.values(responseData).flat().join(', ') ||
                           `Failed to ${isEdit ? 'update' : 'create'} team`;
        console.error('API Error:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error(`Network error ${isEdit ? 'updating' : 'creating'} team:`, error);
      toast.error(`Network error. Please check your connection and try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (!isLoading) {
      form.reset();
      toast.info("Form cleared");
    }
  };

  const selectedMember = users.find(user => `${user.id}-${user.name}` === form.watch("teamMember"));

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
                          <SelectItem key={lead.id} value={`${lead.id}-${lead.name}`}>
                            {lead.name} ({lead.role})
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

            {/* Team Member - Exact Figma Avatar Design */}
            <FormField
              control={form.control}
              name="teamMember"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                    Team Member<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading || usersLoading}>
                    <FormControl>
                      <SelectTrigger className="w-full h-[48px] border-gray-300 focus:border-[#4F46E5] text-[16px] rounded-lg">
                        <SelectValue placeholder={usersLoading ? "Loading users..." : "Select team member"}>
                          {selectedMember && (
                            <div className="flex items-center gap-3">
                              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[12px] font-medium">
                                {selectedMember.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </div>
                              <span className="text-[16px]">{selectedMember.name}</span>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {usersLoading ? (
                        <div className="px-2 py-1 text-sm text-gray-500">Loading users...</div>
                      ) : teamMembers.length > 0 ? (
                        teamMembers.map((member) => (
                          <SelectItem key={member.id} value={`${member.id}-${member.name}`}>
                            <div className="flex items-center gap-3">
                              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[12px] font-medium">
                                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </div>
                              <span>{member.name} ({member.role})</span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1 text-sm text-gray-500">No team members available</div>
                      )}
                    </SelectContent>
                  </Select>
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
                  <FormLabel>Contact Number (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. +1 234 567 890" 
                      {...field}
                      value={field.value || ""}
                      className="transition-colors duration-300 ease-in-out focus:border-purple-500 focus:ring-purple-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>

      {/* Exact Figma Footer Buttons */}
      <div className="px-6 py-6 border-t border-gray-100 bg-[#4F46E5]">
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            disabled={isLoading}
            className="flex-1 h-[48px] bg-[#EF4444] hover:bg-[#DC2626] text-white border-0 text-[16px] font-medium rounded-lg"
          >
            Clear
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
            className="flex-1 h-[48px] bg-[#22C55E] hover:bg-[#16A34A] text-white border-0 text-[16px] font-medium rounded-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? "Updating..." : "Saving..."}
              </>
            ) : (
              isEdit ? "Update Team" : "Save Team"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
