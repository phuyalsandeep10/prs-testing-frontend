"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";


import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


// Mock data
const allUsers = [
  { value: "yubesh_koirala", label: "Yubesh Koirala" },
  { value: "pooja_budhathoki", label: "Pooja Budhathoki" },
  { value: "joshna_khadka", label: "Joshna Khadka" },
  { value: "abinash_tiwari", label: "Abinash Tiwari" },
  { value: "suresh_rai", label: "Suresh Rai" },
];

const formSchema = z.object({
  teamName: z.string().min(1, "Team name is required"),
  teamLead: z.string().min(1, "Team lead is required"),
  teamMembers: z.string().min(1, "At least one team member must be selected"),
  assignedProjects: z.string().min(1, "Assigned project is required"),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
});

interface AddNewTeamFormProps {
  onFormSubmit?: () => void;
}

export function AddNewTeamForm({ onFormSubmit }: AddNewTeamFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamName: "",
      teamLead: "",
      teamMembers: "",
      assignedProjects: "",
      contactNumber: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Simulate API call with a 1.5-second delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // TODO: Replace with your actual API call
      console.log("Form submitted successfully:", values);
      toast.success("Team created successfully!");
      form.reset();
      if (onFormSubmit) {
        onFormSubmit();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast.error(errorMessage);
      console.error("Submission error:", error);
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

  return (
    <div className="flex h-full flex-col bg-white">
      <SheetHeader className="px-6 py-4 text-left">
        <SheetTitle className="text-xl font-semibold text-[#00544B]">Add New Team</SheetTitle>
        <SheetDescription className="text-sm font-medium text-gray-500 pt-2 border-b pb-4">
          Add Information
        </SheetDescription>
      </SheetHeader>

      {/* Form Body */}
      <div className="flex-grow overflow-y-auto p-6">
        <Form {...form}>
          <form id="add-team-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="teamName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-[#2D64E2]">Team Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input className="border-indigo-300 focus:border-indigo-500 h-12" placeholder="Sales Person Name" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="teamLead"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-[#2D64E2]">Team Lead <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input className="border-indigo-300 focus:border-indigo-500 h-12" placeholder="Sales Leader Name" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="teamMembers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-[#2D64E2]">Team Members <span className="text-red-500">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger className="border-indigo-300 focus:border-indigo-500 h-12">
                        <SelectValue placeholder="Abinash Babu Tiwari" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allUsers.map(user => <SelectItem key={user.value} value={user.value}>{user.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="assignedProjects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-[#2D64E2]">Assigned Projects <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input className="border-indigo-300 focus:border-indigo-500 h-12" placeholder="Caillio, Leedheed CRM..." {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-[#2D64E2]">Contact Number <span className="text-red-500">*</span></FormLabel>
                  <div className="flex items-center">
                    <Select defaultValue="+977" disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger className="w-[100px] border-indigo-300 focus:border-indigo-500 rounded-r-none h-12">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="+977">+977</SelectItem>
                        <SelectItem value="+1">+1</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormControl>
                      <Input placeholder="9807057526" {...field} className="border-indigo-300 focus:border-indigo-500 rounded-l-none h-12" disabled={isLoading} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-6 py-4 bg-blue-600">
        <div className="flex justify-end space-x-3">
          <Button onClick={handleClear} variant="destructive" className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-6 py-3" disabled={isLoading}>Clear</Button>
          <Button type="submit" form="add-team-form" className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-6 py-3" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Team"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
