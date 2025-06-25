"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// These should ideally be passed as props
const roles = ["Verifier", "Supervisor", "Salesperson"];
const teams = ["Design Wizards", "Team SEO Warriors", "Sales Giants"];

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  role: z.string().min(1, "Role is required"),
  team: z.string().min(1, "Team is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface AddNewUserFormProps {
  onFormSubmit?: () => void;
}

export function AddNewUserForm({ onFormSubmit }: AddNewUserFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      contactNumber: "",
      password: "",
      confirmPassword: "",
      role: "",
      team: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Form values:", values);
      toast.success("User created successfully!");
      form.reset();
      if (onFormSubmit) {
        onFormSubmit();
      }
    } catch (error) {
      console.error("Failed to create user:", error);
      toast.error("Failed to create user. Please try again.");
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
        <SheetTitle className="text-xl font-semibold text-[#00544B]">Add New User</SheetTitle>
        <SheetDescription className="text-sm font-medium text-gray-500 pt-2 border-b pb-4">
          Add Information
        </SheetDescription>
      </SheetHeader>

      {/* Form Body */}
      <div className="flex-grow overflow-y-auto p-6">
        <Form {...form}>
          <form id="add-user-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-[#2D64E2]">Full Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input className="border-indigo-300 focus:border-indigo-500 h-12" placeholder="Abinash Gokte Tiwari" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-[#2D64E2]">Email <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input type="email" className="border-indigo-300 focus:border-indigo-500 h-12" placeholder="Abinashgoktebabutiwari666@gmail.com" {...field} disabled={isLoading} />
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
            {/* Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-[#2D64E2]">Password <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} className="border-indigo-300 focus:border-indigo-500 h-12" placeholder="**********" {...field} disabled={isLoading} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3">
                          {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-[#2D64E2]">Confirm Password <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showConfirmPassword ? "text" : "password"} className="border-indigo-300 focus:border-indigo-500 h-12" placeholder="**********" {...field} disabled={isLoading} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3">
                          {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* Role and Team */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-[#2D64E2]">Role <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger className="border-indigo-300 focus:border-indigo-500 h-12">
                          <SelectValue placeholder="Verifier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-[#2D64E2]">Team <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger className="border-indigo-300 focus:border-indigo-500 h-12">
                          <SelectValue placeholder="Design wizards" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teams.map(team => <SelectItem key={team} value={team}>{team}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-6 py-4 bg-blue-600">
        <div className="flex justify-end space-x-3">
            <Button onClick={handleClear} variant="destructive" className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-6 py-3" disabled={isLoading}>Clear</Button>
            <Button type="submit" form="add-user-form" className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-6 py-3" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save User"
              )}
            </Button>
        </div>
      </div>
    </div>
  );
}
