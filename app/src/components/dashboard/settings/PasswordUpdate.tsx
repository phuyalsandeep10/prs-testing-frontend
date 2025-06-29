import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, KeyRound, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

// Zod schema for password validation
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      )
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

const PasswordUpdateForm = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
  });

  const newPassword = watch("newPassword") || "";

  // Password validation checks
  const validations = [
    {
      label: "A minimum of 8 characters",
      isValid: newPassword.length >= 8,
    },
    {
      label: "At least one special character",
      isValid: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    },
    {
      label: "At least one number",
      isValid: /[0-9]/.test(newPassword),
    },
    {
      label: "At least one uppercase letter",
      isValid: /[A-Z]/.test(newPassword),
    },
  ];

  const onSubmit = async (data: PasswordFormData) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Password updated successfully:", data);
      alert("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
    }
  };

  interface InputFieldProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    type?: string;
    showPassword: boolean;
    togglePassword: () => void;
    error?: { message?: string };
  }

  const InputField = ({
    label,
    type = "text",
    showPassword,
    togglePassword,
    error,
    ...props
  }: InputFieldProps) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-[#4F46E5]">
        {label}
        <span className="text-red-500 ml-1">*</span>
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : type}
          className={`w-full h-[48px] px-3 pr-10 border rounded-lg focus:ring-2 focus:ring-[#4F46E5] focus:border-[#4F46E5] outline-none transition-colors ${
            error ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="••••••••••••"
          {...props}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error.message}</p>}
    </div>
  );

  return (
    <div className="space-y-6 font-outfit">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="w-6 h-6 text-[#4F46E5]" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Update Password
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Please fill the form below to update your password
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <InputField
            label="Current Password"
            type="password"
            showPassword={showCurrentPassword}
            togglePassword={() =>
              setShowCurrentPassword(!showCurrentPassword)
            }
            error={errors.currentPassword}
            {...register("currentPassword")}
          />

          <InputField
            label="New Password"
            type="password"
            showPassword={showNewPassword}
            togglePassword={() => setShowNewPassword(!showNewPassword)}
            error={errors.newPassword}
            {...register("newPassword")}
          />

          {/* Password Requirements */}
          <div className="space-y-4">
            <p className="text-base font-semibold text-gray-900">
              Your password must contain:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {validations.map((validation, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2"
                >
                  {validation.isValid ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400" />
                  )}
                  <span
                    className={`text-sm ${
                      validation.isValid ? "text-green-600" : "text-gray-600"
                    }`}
                  >
                    {validation.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <InputField
            label="Confirm New Password"
            type="password"
            showPassword={showConfirmPassword}
            togglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            error={errors.confirmPassword}
            {...register("confirmPassword")}
          />

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white px-8 py-2"
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordUpdateForm;
