import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, KeyRound, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
      // Simulate API call
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
    labelClassName?: string;
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
    labelClassName = "",
    ...props
  }: InputFieldProps) => (
    <div className="space-y-2 pt-3">
      <label
        className={cn(
          `text-sm font-semibold text-black pb-2 pt-11 ${labelClassName}`
        )}
      >
        {label}
        <span className="text-red-500 ml-1 text-[13px]">*</span>
      </label>
      <div className="relative mt-2">
        <input
          type={showPassword ? "text" : type}
          className={`w-full h-[48px] px-3 pr-10 border rounded-lg leading-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors pb-2 ${
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
      {error && <p className="text-sm text-red-600">{error.message}</p>}
    </div>
  );

  return (
    <div className=" bg-gray-50 flex items-center justify-center scrollbar-hide p-2 font-outfit">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-lg  ">
          {/* Header */}
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto ">
              <KeyRound className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Update Password
            </h1>
            <p className="text-sm text-gray-600 mt-1 mb-4">
              Please fill the form below to update password
            </p>
          </div>

          {/* Form */}
          <div
            className="space-y-4 border border-gray-200 pl-7 pr-4 pt-4 pb-7 h-full   border-t-0 border-r-0"
            style={{ boxShadow: "-4px 4px 8px rgba(0, 0, 0, 0.1)" }}
          >
            <InputField
              label="Current Password"
              type="password"
              showPassword={showCurrentPassword}
              togglePassword={() =>
                setShowCurrentPassword(!showCurrentPassword)
              }
              labelClassName="pt-6"
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
            <div className="space-y-6">
              <p className="text-md font-semibold text-black">
                Your password must contains:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {validations.map((validation, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 mb-[12px]"
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
              label="Confirm Password"
              type="password"
              showPassword={showConfirmPassword}
              togglePassword={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              error={errors.confirmPassword}
              {...register("confirmPassword")}
            />

            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 outline-none"
            >
              {isSubmitting ? "Updating Password..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordUpdateForm;
