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

// Sample data - should ideally come from props or API
const teamLeads = [
  { id: "1", name: "Sales Leader Name", role: "Sales Lead" },
  { id: "2", name: "Design Leader Name", role: "Design Lead" },
  { id: "3", name: "Dev Leader Name", role: "Dev Lead" },
];

const teamMembers = [
  { id: "1", name: "Abinash Babu Tiwari", email: "abinash@example.com", avatar: "/avatars/abinash.jpg" },
  { id: "2", name: "John Doe", email: "john@example.com", avatar: "/avatars/john.jpg" },
  { id: "3", name: "Jane Smith", email: "jane@example.com", avatar: "/avatars/jane.jpg" },
];

const projects = [
  "Cotillo, Leedheed CRM",
  "E-commerce Platform",
  "Mobile App Development", 
  "Website Redesign",
  "Payment System Integration",
];

const formSchema = z.object({
  teamName: z.string().min(1, "Team name is required"),
  teamLead: z.string().min(1, "Team lead is required"),
  teamMember: z.string().min(1, "Team member is required"),
  assignedProject: z.string().min(1, "Assigned project is required"),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
});

interface AddNewTeamFormProps {
  onClose: () => void;
  onFormSubmit?: () => void;
  initialData?: any;
  isEdit?: boolean;
}

export function AddNewTeamForm({ onClose, onFormSubmit, initialData, isEdit = false }: AddNewTeamFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Form values:", values);
      toast.success(`Team ${isEdit ? 'updated' : 'created'} successfully!`);
      form.reset();
      if (onFormSubmit) {
        onFormSubmit();
      }
      onClose();
    } catch (error) {
      console.error(`Failed to ${isEdit ? 'update' : 'create'} team:`, error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} team. Please try again.`);
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

  const selectedMember = teamMembers.find(member => member.name === form.watch("teamMember"));

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
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger className="w-full h-[48px] border-gray-300 focus:border-[#4F46E5] text-[16px] rounded-lg">
                        <SelectValue placeholder="Sales Leader Name" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teamLeads.map((lead) => (
                        <SelectItem key={lead.id} value={lead.name}>
                          {lead.name}
                        </SelectItem>
                      ))}
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
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger className="w-full h-[48px] border-gray-300 focus:border-[#4F46E5] text-[16px] rounded-lg">
                        <SelectValue placeholder="Select team member">
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
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.name}>
                          <div className="flex items-center gap-3">
                            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[12px] font-medium">
                              {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <span>{member.name}</span>
                          </div>
                        </SelectItem>
                      ))}
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
                    Assigned Project<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger className="w-full h-[48px] border-gray-300 focus:border-[#4F46E5] text-[16px] rounded-lg">
                        <SelectValue placeholder="Cotillo, Leedheed CRM, ..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project} value={project}>
                          {project}
                        </SelectItem>
                      ))}
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
                  <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                    Contact Number<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <div className="flex items-center gap-0">
                    <Select defaultValue="+977" disabled={isLoading}>
                      <SelectTrigger className="w-[100px] h-[48px] border-gray-300 focus:border-[#4F46E5] rounded-r-none rounded-l-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+977">+977</SelectItem>
                        <SelectItem value="+1">+1</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormControl>
                      <Input 
                        placeholder="9807057526" 
                        {...field} 
                        className="h-[48px] border-gray-300 focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-l-none rounded-r-lg border-l-0" 
                        disabled={isLoading} 
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-[12px] text-red-500 mt-1" />
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
