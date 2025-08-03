"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useTeamsQuery,
} from "@/hooks/useIntegratedQuery";
import {
  useOrganizationRoles,
  useRoles as useAllRoles,
  Role,
} from "@/hooks/api/useRoles";

// Static fallback roles – shown when API call fails or returns empty
const FALLBACK_ROLES: Array<{ id: string; name: string }> = [
  { id: "Salesperson", name: "Salesperson" },
  { id: "Verifier", name: "Verifier" },
  { id: "Supervisor", name: "Supervisor" },
  { id: "Team Member", name: "Team Member" },
];
import { useAuth, useUI } from "@/stores";
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
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// We will fetch available roles from the backend instead of hard coding

const formSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be less than 100 characters")
      .regex(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces"),
    email: z
      .string()
      .email("Invalid email address")
      .max(254, "Email must be less than 254 characters"),
    contactNumber: z
      .string()
      .min(10, "Contact number must be at least 10 digits"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be less than 128 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string(),
    role: z.string().min(1, "Role is required"),
    team: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

interface AddNewUserFormWrapperProps {
  onClose: () => void;
  onFormSubmit?: () => void;
  initialData?: any;
  isEdit?: boolean;
}

export function AddNewUserFormWrapper({
  onClose,
  onFormSubmit,
  initialData,
  isEdit = false,
}: AddNewUserFormWrapperProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [passwordValue, setPasswordValue] = React.useState("");
  const { user } = useAuth();
  const { addNotification } = useUI();

  // ---- Fetch dynamic data ----
  // Teams
  const { data: teamsData, isLoading: teamsLoading } = useTeamsQuery();
  const teams = teamsData?.data || [];

  // Roles for the current organization (fallback to all roles if user not tied to org)
  const organizationId = user?.organizationId ?? "";
  const { data: apiRoles, isLoading: orgRolesLoading } =
    useOrganizationRoles(organizationId);

  // Use API roles if available, otherwise use the hardcoded fallback
  const availableRoles =
    apiRoles && apiRoles.length > 0 ? apiRoles : FALLBACK_ROLES;

  // Filter roles to only show the ones that should be available for user creation
  const allowedRoleNames = [
    "Salesperson",
    "Verifier",
    "Supervisor",
    "Team Member",
  ];
  const organizationRoles = availableRoles
    .filter((role) => allowedRoleNames.includes(role.name))
    .map((r) => ({ id: r.id ?? r.name, name: r.name }));

  // Helper: map role ID to name for default values in edit mode
  const findRoleIdByName = (name?: string): string => {
    if (!name) return "";
    const match = (organizationRoles as any[]).find(
      (r) => r.name.toLowerCase() === name.toLowerCase()
    );
    return match ? match.id.toString() : "";
  };

  // Mutations
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      email: initialData?.email || "",
      contactNumber: initialData?.phoneNumber?.replace("+977 - ", "") || "",
      password: "",
      confirmPassword: "",
      role: findRoleIdByName(initialData?.role),
      team: initialData?.assignedTeam || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // console.log('📝 [USER_TABLE_DEBUG] Form submission started');
      // console.log('📝 [USER_TABLE_DEBUG] Form values:', values);

      // Prepare user data
      const [firstName, ...lastNameParts] = values.fullName.trim().split(" ");
      const lastName = lastNameParts.join(" ") || firstName;

      const userData: any = {
        username: values.email.split("@")[0],
        first_name: firstName,
        last_name: lastName,
        email: values.email,
        contact_number: `+977-${values.contactNumber}`,
        password: values.password,
        role: values.role, // Pass the role name (string) directly
        is_active: true,
      };

      // console.log('📤 [USER_TABLE_DEBUG] Sending user data:', userData);

      if (values.team) {
        userData.teams = [values.team];
      }

      if (isEdit && initialData?.id) {
        // console.log('🔄 [USER_TABLE_DEBUG] Updating existing user...');
        await updateUserMutation.mutateAsync({
          id: initialData.id,
          data: userData,
        });
        window.dispatchEvent(
          new CustomEvent("userUpdated", { detail: { id: initialData.id } })
        );
      } else {
        // console.log('➕ [USER_TABLE_DEBUG] Creating new user...');
        const result = await createUserMutation.mutateAsync(userData);
        // console.log('✅ [USER_TABLE_DEBUG] User created successfully, dispatching events...');

        // Dispatch custom event for compatibility
        window.dispatchEvent(
          new CustomEvent("userCreated", { detail: { id: result.id } })
        );

        // Additional manual refresh trigger - dispatch a custom event that ManageUsersPage can listen to
        setTimeout(() => {
          // console.log('🔄 [USER_TABLE_DEBUG] Dispatching manual refresh event...');
          window.dispatchEvent(
            new CustomEvent("forceUserTableRefresh", {
              detail: { userId: result.id },
            })
          );
        }, 500);
      }

      form.reset();
      if (onFormSubmit) {
        onFormSubmit();
      }
      onClose();
    } catch (error) {
      // console.error('❌ [USER_TABLE_DEBUG] Error in form submission:', error);
    }
  };

  const handleClear = () => {
    if (!isLoading) {
      form.reset();
      toast.info('Form cleared', { description: 'All form fields have been reset.' });
    }
  };

  // Combined loading state from mutations
  const isLoading =
    createUserMutation.isPending ||
    updateUserMutation.isPending ||
    orgRolesLoading;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Exact Figma Header */}
      <div className="px-6 py-2">
        {/* <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-semibold text-[#22C55E]">
            {isEdit ? "Edit User" : "Add New User"}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div> */}
        <p className="text-[16px] font-medium leading-6 text-[#31323A] mt-2">
          Add Information
        </p>
      </div>

      {/* Form Body - Exact Figma Layout */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
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
                      className="h-[48px] shadow-[0px_0px_4px_0px_#8393FC] focus-visible:border-[#6B7FFF] focus-visible:outline-[#6B7FFF] focus:ring-[#6B7FFF] text-[16px] rounded-[6px]"
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
                      className="h-[48px] shadow-[0px_0px_4px_0px_#8393FC] focus-visible:border-[#6B7FFF] focus-visible:outline-[#6B7FFF] focus:ring-[#6B7FFF] text-[16px] rounded-[6px]"
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
                  <FormControl>
                    <PhoneInput
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Enter phone number"
                      disabled={isLoading}
                      className="w-full"
                      inputClassName="h-[48px] shadow-[0px_0px_4px_0px_#8393FC] focus-visible:border-[#6B7FFF] focus-visible:outline-[#6B7FFF] focus:ring-[#6B7FFF] text-[16px]"
                    />
                  </FormControl>
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
                          className="h-[48px] shadow-[0px_0px_4px_0px_#8393FC] focus-visible:border-[#6B7FFF] focus-visible:outline-[#6B7FFF] focus:ring-[#6B7FFF] text-[16px] rounded-[6px]"
                          placeholder="************"
                          {...field}
                          disabled={isLoading}
                          onChange={(e) => {
                            field.onChange(e);
                            setPasswordValue(e.target.value);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
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
                      Confirm Password
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          className="h-[48px] shadow-[0px_0px_4px_0px_#8393FC] focus-visible:border-[#6B7FFF] focus-visible:outline-[#6B7FFF] focus:ring-[#6B7FFF] text-[16px] rounded-[6px]"
                          placeholder="************"
                          {...field}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[12px] text-red-500 mt-1" />
                  </FormItem>
                )}
              />
            </div>

            {/* Password Requirements Display */}
            {passwordValue && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-[14px] font-medium text-gray-900 mb-3">
                  Password Requirements:
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      label: "At least 8 characters",
                      test: passwordValue.length >= 8,
                    },
                    {
                      label: "One uppercase letter",
                      test: /[A-Z]/.test(passwordValue),
                    },
                    {
                      label: "One lowercase letter",
                      test: /[a-z]/.test(passwordValue),
                    },
                    { label: "One number", test: /\d/.test(passwordValue) },
                    {
                      label: "One special character",
                      test: /[@$!%*?&]/.test(passwordValue),
                    },
                  ].map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          req.test ? "bg-green-500" : "bg-gray-300"
                        }`}
                      />
                      <span
                        className={`text-[12px] ${
                          req.test ? "text-green-700" : "text-gray-600"
                        }`}
                      >
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Role and Team */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                      Role<span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl className="w-full !h-[48px] py-2 px-3 text-[16px] rounded-[6px] bg-white shadow-[0px_0px_4px_0px_#8393FC] outline-1 active:outline-[#4F46E5] focus:border-[#4F46E5] focus:outline-1  focus:outline-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] focus:outline-offset-1 ">
                        <SelectTrigger
                          className="w-full !h-[48px] py-2 px-3 text-[16px] rounded-[6px] bg-white
  shadow-[0px_0px_4px_0px_#8393FC] outline-1 
  focus:outline-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] focus:outline-offset-1
  data-[state=open]:outline data-[state=open]:outline-[#4F46E5] 
  data-[state=open]:ring-1 data-[state=open]:ring-[#4F46E5] 
  data-[state=open]:outline-offset-1"
                        >
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {organizationRoles.map((role) => (
                          <SelectItem key={role.id} value={role.name}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[12px] text-red-500 mt-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="team"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                      Team
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        disabled={isLoading || teamsLoading}
                        className="inline-block w-full h-[48px] border border-gray-300 text-[16px] rounded-lg px-3 focus:outline-1 focus:outline-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]  bg-white shadow-[0px_0px_4px_0px_#8393FC]"
                      >
                        <option value="">
                          {teamsLoading
                            ? "Loading teams..."
                            : teams.length === 0
                            ? "No teams available"
                            : "Select team"}
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
            ) : isEdit ? (
              "Update User"
            ) : (
              "Save User"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
