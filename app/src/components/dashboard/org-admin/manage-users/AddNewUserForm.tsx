"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define available roles as per user requirements
const availableRoles = ["Salesperson", "Verifier", "Team Member", "Supervisor/Team Lead"];

// Interface for team data
interface TeamOption {
  id: number;
  name: string;
}

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  role: z.string().min(1, "Role is required"),
  team: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface AddNewUserFormProps {
  onClose: () => void;
  onFormSubmit?: () => void;
  initialData?: any;
  isEdit?: boolean;
}

export function AddNewUserForm({ onClose, onFormSubmit, initialData, isEdit = false }: AddNewUserFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [teams, setTeams] = React.useState<TeamOption[]>([]);
  const [teamsLoading, setTeamsLoading] = React.useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      email: initialData?.email || "",
      contactNumber: initialData?.phoneNumber?.replace('+977 - ', '') || "",
      password: "",
      confirmPassword: "",
      role: initialData?.role || "",
      team: initialData?.assignedTeam || "",
    },
  });

  // Load teams from API
  React.useEffect(() => {
    const loadTeams = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setTeamsLoading(false);
          return;
        }

        const response = await fetch('http://localhost:8000/api/v1/teams/', {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const teamsList = Array.isArray(data) ? data : data.results || [];
          setTeams(teamsList.map((team: any) => ({
            id: team.id,
            name: team.name
          })));
        } else {
          console.error('Failed to load teams:', response.status);
        }
      } catch (error) {
        console.error('Error loading teams:', error);
      } finally {
        setTeamsLoading(false);
      }
    };

    loadTeams();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        setIsLoading(false);
        return;
      }

      // Prepare user data
      const [firstName, ...lastNameParts] = values.fullName.trim().split(' ');
      const lastName = lastNameParts.join(' ') || firstName;
      
      const userData: any = {
        username: values.email.split('@')[0],
        first_name: firstName,
        last_name: lastName,
        email: values.email,
        contact_number: `+977-${values.contactNumber}`,
        password: values.password,
        role_name: values.role,
        is_active: true
      };

      if (values.team) {
        userData.teams = [values.team];
      }

      console.log('Sending user data:', userData);

      const url = isEdit 
        ? `http://localhost:8000/api/v1/auth/users/${initialData?.id}/`
        : 'http://localhost:8000/api/v1/auth/users/';
        
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const responseData = await response.json();
      console.log('API Response:', responseData);

      if (response.ok) {
        toast.success(`User ${isEdit ? 'updated' : 'created'} successfully!`);
        
        // Trigger refresh events
        const event = new CustomEvent(isEdit ? 'userUpdated' : 'userCreated', {
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
                           `Failed to ${isEdit ? 'update' : 'create'} user`;
        console.error('API Error:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error(`Network error ${isEdit ? 'updating' : 'creating'} user:`, error);
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

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Exact Figma Header */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-semibold text-[#22C55E]">
            {isEdit ? "Edit User" : "Add New User"}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-[14px] text-gray-500 mt-2">Add Information</p>
      </div>

      {/* Form Body - Exact Figma Layout */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                    Full name<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      className="h-[48px] border-gray-300 focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-lg" 
                      placeholder="Abinash Gokte Tiwari" 
                      {...field} 
                      disabled={isLoading} 
                    />
                  </FormControl>
                  <FormMessage className="text-[12px] text-red-500 mt-1" />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                    Email<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      className="h-[48px] border-gray-300 focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-lg" 
                      placeholder="Abinashgoktebabutiwari666@gmail.com" 
                      {...field} 
                      disabled={isLoading} 
                    />
                  </FormControl>
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

            {/* Password Fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                      Password<span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          className="h-[48px] border-gray-300 focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-lg pr-12" 
                          placeholder="************" 
                          {...field} 
                          disabled={isLoading} 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)} 
                          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? 
                            <EyeOff className="h-4 w-4" /> : 
                            <Eye className="h-4 w-4" />
                          }
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[12px] text-red-500 mt-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                      Confirm Password<span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showConfirmPassword ? "text" : "password"} 
                          className="h-[48px] border-gray-300 focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-lg pr-12" 
                          placeholder="************" 
                          {...field} 
                          disabled={isLoading} 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? 
                            <EyeOff className="h-4 w-4" /> : 
                            <Eye className="h-4 w-4" />
                          }
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[12px] text-red-500 mt-1" />
                  </FormItem>
                )}
              />
            </div>

            {/* Role and Team */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                      Roles<span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        disabled={isLoading}
                        className="w-full h-[48px] border border-gray-300 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] text-[16px] rounded-lg px-3 bg-white"
                      >
                        <option value="">Select a role</option>
                        {availableRoles.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage className="text-[12px] text-red-500 mt-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="team"
                render={({ field }) => (
                                  <FormItem>
                  <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">Team</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={isLoading || teamsLoading}
                      className="w-full h-[48px] border border-gray-300 focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] text-[16px] rounded-lg px-3 bg-white"
                    >
                      <option value="">
                        {teamsLoading ? "Loading teams..." : teams.length === 0 ? "No teams available" : "Select team"}
                      </option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.name}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage className="text-[12px] text-red-500 mt-1" />
                </FormItem>
                )}
              />
            </div>
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
              isEdit ? "Update User" : "Save User"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
