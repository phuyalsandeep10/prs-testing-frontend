"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, X } from "lucide-react";
import {
  useCreateTeamMutation,
  useUsersQuery,
  useDealsQuery,
} from "@/hooks/useIntegratedQuery";
import { useProjects } from "@/hooks/api";
import { useAuth, useUI } from "@/stores";
import Image from "next/image";
import CloseBtn from "@/assets/icons/close-blue.svg";
import { toast } from 'sonner';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  teamMembers: z
    .array(z.string())
    .min(1, "At least one team member is required"),
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
  isEdit = false,
}: AddNewTeamFormWrapperProps) {
  const { user } = useAuth();
  const { addNotification } = useUI();

  // Correctly get and parse organization ID
  const orgIdStr = user?.organizationId ? String(user.organizationId) : "";
  const orgIdNum = user?.organizationId
    ? parseInt(user.organizationId, 10)
    : undefined;

  // Correctly call the query hooks with the organization ID
  const { data: usersData, isLoading: usersLoading } = useUsersQuery(orgIdStr, {
    page_size: 1000,
  });
  const { data: projects = [], isLoading: projectsLoading } =
    useProjects(orgIdNum);
  const { data: dealsData, isLoading: dealsLoading } = useDealsQuery();

  console.log(
    "[AddNewTeamFormWrapper] Data received from useUsersQuery:",
    usersData
  );
  console.log("[AddNewTeamFormWrapper] Users loading state:", usersLoading);
  console.log(
    "[AddNewTeamFormWrapper] Projects from standardized hook:",
    projects
  );
  console.log(
    "[AddNewTeamFormWrapper] Projects loading state:",
    projectsLoading
  );
  console.log("[AddNewTeamFormWrapper] Deals data:", dealsData);
  console.log("[AddNewTeamFormWrapper] Deals loading state:", dealsLoading);

  const users: any[] = React.useMemo(() => {
    if (!usersData) return [];
    const d: any = usersData;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d.results)) return d.results;
    if (Array.isArray(d.data)) return d.data;
    return [];
  }, [usersData]);

  // Extract deals data for projects field
  const deals: any[] = React.useMemo(() => {
    if (!dealsData) return [];
    const d: any = dealsData;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d.results)) return d.results;
    if (Array.isArray(d.data)) return d.data;
    return [];
  }, [dealsData]);

  // Debug deals data
  console.log("[AddNewTeamFormWrapper] Raw dealsData:", dealsData);
  console.log("[AddNewTeamFormWrapper] Processed deals:", deals);
  console.log("[AddNewTeamFormWrapper] Deals length:", deals.length);

  // Create team mutation
  const createTeamMutation = useCreateTeamMutation();

  // Filter users based on their roles
  const extractRoleName = (u: any) =>
    typeof u.role === "string" ? u.role : u.role?.name || "";

  // Team leads should only show users with Supervisor role
  const teamLeads = users
    .filter((u: any) => {
      if (!u || !u.id) return false;
      const roleName = extractRoleName(u).toLowerCase();
      return roleName === "supervisor";
    })
    .map((u: any) => ({
      ...u,
      displayName:
        `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() ||
        u.name ||
        u.username,
    }));

  // Team members should only show users with Team Member role
  const teamMembers = users
    .filter((u: any) => {
      if (!u || !u.id) return false;
      const roleName = extractRoleName(u).toLowerCase();
      return roleName === "team member";
    })
    .map((u: any) => ({
      ...u,
      displayName:
        `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() ||
        u.name ||
        u.username,
    }));

  // Debug logs (can be removed in production)
  React.useEffect(() => {
    console.log("=== DROPDOWN DEBUG INFO ===");
    console.log("Users state:", users);
    console.log("Team leads filtered:", teamLeads);
    console.log("Team members filtered:", teamMembers);
    console.log("Users loading:", usersLoading);
    console.log("Projects from hook:", projects);
    console.log("Projects loading:", projectsLoading);
    console.log("Deals for projects:", deals);
    console.log("Deals loading:", dealsLoading);
  }, [
    users,
    teamLeads,
    teamMembers,
    usersLoading,
    projects,
    projectsLoading,
    deals,
    dealsLoading,
  ]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamName: initialData?.teamName || "",
      teamLead: initialData?.teamLead || "",
      teamMembers:
        initialData?.teamMembers?.map((m: any) => `${m.id}-${m.name}`) || [],
      assignedProject: initialData?.assignedProjects || "",
      contactNumber: initialData?.contactNumber || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Resolve organization ID (supports multiple possible field names)
      const orgId =
        (user as any)?.organizationId ??
        (user as any)?.organization ??
        (user as any)?.organization_id;

      // Extract IDs from form values
      const teamLeadId = parseInt(values.teamLead.split("-")[0], 10);
      const teamMemberIds = values.teamMembers.map((member) =>
        parseInt(member.split("-")[0], 10)
      );

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
        // Store the deal ID as a project reference
        teamData.projects = [parseInt(values.assignedProject, 10)];
      }

      // Use the create mutation (note: update mutation would need to be added to integrated hooks)
      if (isEdit) {
        toast.warning('Edit not implemented', { description: 'Team editing functionality needs to be implemented.' });
        return;
      }

      console.log("=== SUBMITTING TEAM DATA ===");
      console.log("Team data being sent:", teamData);

      await createTeamMutation.mutateAsync(teamData);

      // Success handling is done in the mutation hook
      form.reset();

      // Trigger custom event for parent component to refresh data
      console.log("=== DISPATCHING TEAM CREATED EVENT ===");
      window.dispatchEvent(new CustomEvent("teamCreated"));

      if (onFormSubmit) {
        onFormSubmit();
      }
      onClose();
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error(`Error ${isEdit ? "updating" : "creating"} team:`, error);
    }
  };

  // Combined loading state from mutations
  const isLoading =
    createTeamMutation.isPending ||
    usersLoading ||
    projectsLoading ||
    dealsLoading;

  const handleClear = () => {
    form.reset();
    console.log("Form cleared");
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 ">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-medium leading-6 text-[#31323A] mt-2">
            Add Information
          </h2>
        </div>
        {/* <p className="text-sm text-gray-500 mt-1">Add Information</p> */}
      </div>

      {/* Form Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <Form {...form}>
          <form
            id="team-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* Team Name */}
            <FormField
              control={form.control}
              name="teamName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-indigo-600">
                    Team Name<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-12 focus-visible:border-[#6B7FFF] focus-visible:outline-[#6B7FFF] focus:ring-[#6B7FFF] text-[16px] rounded-[6px]"
                      placeholder="Enter team name (e.g., Sales Team Alpha, Marketing Team Beta)"
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
                  <FormLabel className="text-sm font-medium text-indigo-600 ">
                    Team Lead<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger
                        className="!h-12 w-full focus:outline-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] focus:outline-offset-1
  data-[state=open]:outline data-[state=open]:outline-[#4F46E5] 
  data-[state=open]:ring-1 data-[state=open]:ring-[#4F46E5] 
  data-[state=open]:outline-offset-1 text-[16px] rounded-[6px]"
                      >
                        <SelectValue placeholder="Select a supervisor to lead this team (e.g., John Doe)" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamLeads.length === 0 ? (
                          <div className="px-2 py-1 text-sm text-gray-500">
                            No supervisors available. Please create a supervisor
                            first.
                          </div>
                        ) : (
                          teamLeads.map((lead) => (
                            <SelectItem
                              key={lead.id}
                              value={`${lead.id}-${lead.displayName}`}
                            >
                              {lead.displayName} ({lead.email})
                            </SelectItem>
                          ))
                        )}
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
                  <FormLabel className="text-sm font-medium text-indigo-600">
                    Team Member<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="h-auto p-2 space-y-2 border rounded-lg min-h-[48px] focus:!outline focus:!outline-1 focus:!outline-[#4F46E5] focus:!border-[#4F46E5] focus:!ring-1 focus:!ring-[#4F46E5] text-[16px] px-3 bg-white shadow-[0px_0px_4px_0px_#8393FC]">
                      {teamMembers.length === 0 ? (
                        <div className="text-gray-500 text-sm py-2 px-3 ">
                          No team members available. Please create team members
                          first.
                        </div>
                      ) : (
                        teamMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`member-${member.id}`}
                              checked={field.value.includes(
                                `${member.id}-${member.displayName}`
                              )}
                              onCheckedChange={(checked) => {
                                const memberValue = `${member.id}-${member.displayName}`;
                                if (checked) {
                                  field.onChange([...field.value, memberValue]);
                                } else {
                                  field.onChange(
                                    field.value.filter((v) => v !== memberValue)
                                  );
                                }
                              }}
                              disabled={isLoading}
                            />
                            <label
                              htmlFor={`member-${member.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {member.displayName}
                            </label>
                          </div>
                        ))
                      )}
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
                  <FormLabel className="text-sm font-medium text-indigo-600">
                    Assigned Project<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger
                        className="!h-12 w-full focus:outline-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] focus:outline-offset-1
  data-[state=open]:outline data-[state=open]:outline-[#4F46E5] 
  data-[state=open]:ring-1 data-[state=open]:ring-[#4F46E5] 
  data-[state=open]:outline-offset-1rounded-[6px] shadow-[0px_0px_4px_0px_#8393FC]"
                      >
                        <SelectValue placeholder="Select a deal to assign to this team (e.g., Deal Name)" />
                      </SelectTrigger>
                      <SelectContent>
                        {deals.length === 0 ? (
                          <div className="px-2 py-1 text-sm text-gray-500">
                            No deals available
                          </div>
                        ) : (
                          deals.map((deal) => (
                            <SelectItem
                              key={deal.id}
                              value={deal.id.toString()}
                            >
                              {deal.deal_name || deal.name || `Deal ${deal.id}`}
                            </SelectItem>
                          ))
                        )}
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
                  <FormLabel className="text-sm font-medium text-indigo-600">
                    Contact Number<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-12 focus:!outline-[#4F46E5] focus:ring-1 focus:!ring-[#4F46E5] text-[16px] rounded-[6px] px-3 bg-white shadow-[0px_0px_4px_0px_#8393FC]"
                      placeholder="Enter team contact number (e.g., +977 - 9807057526)"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>

      {/* Footer with buttons */}
      <div className="px-6 py-4 bg-blue-600 flex justify-end space-x-3">
        <Button
          type="button"
          onClick={handleClear}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg"
          disabled={isLoading}
        >
          Clear
        </Button>
        <Button
          type="submit"
          form="team-form" // Make sure this matches the form id if you add one
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? "Updating..." : "Saving..."}
            </>
          ) : (
            "Save Team"
          )}
        </Button>
      </div>
    </div>
  );
}
