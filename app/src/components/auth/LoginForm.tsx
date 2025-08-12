"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuth, useUI } from "@/stores";
import { apiClient } from "@/lib/api-client";
import { redirectUserByRole } from '@/lib/utils/routing';

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

// Types for login responses
interface LoginResponse {
  token?: string;
  user?: any;
  requires_otp?: boolean;
  requires_password_change?: boolean;
  user_type?: "super_admin" | "org_admin";
  temporary_token?: string;
}

interface OTPResponse {
  message?: string;
  success?: boolean;
}

interface OTPVerifyResponse {
  token?: string;
  user?: any;
  requires_password_change?: boolean;
  temporary_token?: string;
}

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const otpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  otp: z.string().min(6, "OTP must be at least 6 characters"),
});

// Enhanced login mutations that handle complex authentication flows
const useLoginMutation = () => {
  const { login } = useAuth();
  const { addNotification } = useUI();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
      // Try regular login first, then admin endpoints if needed
      try {
        console.log("🔐 Trying regular login first...");
        const regularResponse = await apiClient.post<LoginResponse>(
          "/auth/login/",
          credentials
        );
        console.log("✅ Regular login successful");
        console.log("📦 Full regular response:", regularResponse);
        return regularResponse || {};
      } catch (regularError: any) {
        console.log("❌ Regular login failed, trying admin endpoints...");
        console.log("❌ Regular error status:", regularError.status);
        console.log("❌ Regular error message:", regularError.message);
        
        // If regular login fails, try admin endpoints
        if (regularError.status === 401 || regularError.message?.includes('401')) {
          try {
            console.log("🔐 Trying super admin login...");
            const superAdminResponse = await apiClient.post<LoginResponse>(
              "/auth/login/super-admin/",
              credentials
            );
            console.log("✅ Super admin login successful");
            return superAdminResponse || {};
          } catch (superAdminError: any) {
            console.log("❌ Super admin login failed, trying org admin...");
            console.log("❌ Super admin error status:", superAdminError.status);
            console.log("❌ Super admin error message:", superAdminError.message);
            
            if (superAdminError.status === 401 || superAdminError.message?.includes('401')) {
              try {
                console.log("🔐 Trying org admin login...");
                const orgAdminResponse = await apiClient.post<LoginResponse>(
                  "/auth/login/org-admin/",
                  credentials
                );
                console.log("✅ Org admin login successful");
                return orgAdminResponse || {};
              } catch (orgAdminError: any) {
                console.log("❌ All login attempts failed");
                console.log("❌ Org admin error status:", orgAdminError.status);
                console.log("❌ Org admin error message:", orgAdminError.message);
                // If all fail, throw the original error
                throw regularError;
              }
            }
            throw superAdminError;
          }
        }
        throw regularError;
      }
    },
    onError: (error: any) => {
      console.log("❌ Login mutation error:", error);
      console.log("❌ Error status:", error.status);
      console.log("❌ Error message:", error.message);
      
      // Handle rate limiting errors with specific messaging
      if (error.status === 429 || error.code === 'RATE_LIMIT_EXCEEDED') {
        addNotification({
          type: "error",
          title: "Too Many Login Attempts",
          message: "You've made too many login attempts. Please wait a moment before trying again.",
        });
      } else {
        addNotification({
          type: "error",
          title: "Login Failed",
          message: error.message || "Invalid credentials. Please try again.",
        });
      }
    },
  });
};

const useOTPVerifyMutation = () => {
  const { login } = useAuth();
  const { addNotification } = useUI();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ email, otp, userType }: { email: string; otp: string; userType?: string }): Promise<OTPVerifyResponse> => {
      // Determine the correct verification endpoint based on user type
      let endpoint = "/auth/login/verify/"; // fallback
      
      if (userType === "super_admin") {
        endpoint = "/auth/login/super-admin/verify/";
      } else if (userType === "org_admin") {
        endpoint = "/auth/login/org-admin/verify/";
      }
      
      console.log("🌐 Using OTP endpoint:", endpoint);
      console.log("📤 Sending OTP verification request:", { email, otp, userType });
      
      const response = await apiClient.post<OTPVerifyResponse>(
        endpoint,
        { email, otp }
      );
      
      console.log("📥 OTP verification response:", response);
      return response;
    },
    onSuccess: (data, variables) => {
      if (data.requires_password_change && data.temporary_token) {
        localStorage.setItem("tempToken", data.temporary_token);
        localStorage.setItem("tempEmail", variables.email);
        router.push("/change-password");
      } else if (data.token && data.user) {
        login(data.token, data.user);
        addNotification({
          type: "success",
          title: "Login Successful",
          message: `Welcome back, ${data.user.first_name || data.user.email}!`,
        });
        redirectUserByRole(data.user, router, addNotification);
      }
    },
    onError: (error: any) => {
      // Handle rate limiting errors with specific messaging
      if (error.status === 429 || error.code === 'RATE_LIMIT_EXCEEDED') {
        addNotification({
          type: "error",
          title: "Too Many OTP Attempts",
          message: "You've made too many OTP verification attempts. Please wait a moment before trying again.",
        });
      } else {
        addNotification({
          type: "error",
          title: "OTP Verification Failed",
          message: error.message || "Invalid OTP. Please try again.",
        });
      }
    },
  });
};

export default function LoginForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [step, setStep] = React.useState<"login" | "otp">("login");
  const [userEmail, setUserEmail] = React.useState<string>("");
  const router = useRouter();
  const { login } = useAuth();
  const { addNotification } = useUI();

  // Mutations
  const loginMutation = useLoginMutation();
  const otpVerifyMutation = useOTPVerifyMutation();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      email: "",
      otp: "",
    },
  });

  // Set email field in OTP form when transitioning to OTP step
  React.useEffect(() => {
    if (step === "otp" && userEmail) {
      otpForm.setValue("email", userEmail);
    }
  }, [step, userEmail, otpForm]);

  // Handle regular login submission
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      console.log("🔐 Attempting login for:", values.email);
      const result = await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });
      
      console.log("📥 Login response:", result);
      
      if (result && result.requires_otp) {
        console.log("📱 OTP required, user type:", result.user_type);
        setUserEmail(values.email);
        // Store user type for OTP verification
        if (result.user_type) {
          localStorage.setItem("userType", result.user_type);
        }
        setStep("otp");
      } else if (result && result.requires_password_change && result.temporary_token) {
        console.log("🔑 Password change required for user type:", result.user_type);
        localStorage.setItem("tempToken", result.temporary_token);
        localStorage.setItem("tempEmail", values.email);
        if (result.user_type) {
          localStorage.setItem("userType", result.user_type);
        }
        router.push("/change-password");
      } else if (result && result.token && result.user) {
        console.log("✅ Direct login successful");
        login(result.token, result.user);
        addNotification({
          type: "success",
          title: "Login Successful",
          message: `Welcome back, ${result.user.first_name || result.user.email}!`,
        });
        handleSuccessfulLoginRedirect(result.user);
      } else {
        console.error("❌ Login response is undefined or invalid");
        addNotification({
          type: "error",
          title: "Login Failed",
          message: "Invalid response from server. Please try again.",
        });
      }
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error("❌ Login error:", error);
    }
  };

  // Handle OTP verification
  const onOtpSubmit = async (values: z.infer<typeof otpSchema>) => {
    try {
      const userType = localStorage.getItem("userType");
      console.log("🔐 OTP verification for user type:", userType);
      console.log("📧 Email:", values.email);
      console.log("🔢 OTP:", values.otp);
      
      await otpVerifyMutation.mutateAsync({
        email: values.email,
        otp: values.otp,
        userType: userType || undefined,
      });
      // Clean up stored user type after successful verification
      localStorage.removeItem("userType");
    } catch (error) {
      // Error handling is done in the mutation
      console.error("❌ OTP verification error:", error);
    }
  };

  const handleSuccessfulLoginRedirect = (user: any) => {
    redirectUserByRole(user, router, addNotification);
  };

  const isLoading =
    loginMutation.isPending ||
    otpVerifyMutation.isPending;

  if (step === "otp") {
    // OTP Verification Form
    return (
      <Form {...otpForm}>
        <form
          onSubmit={otpForm.handleSubmit(onOtpSubmit)}
          className="space-y-6 text-left"
        >
          <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              An OTP has been sent to your email address. Please check your
              email and enter the code below.
            </p>
          </div>
          <FormField
            control={otpForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-blue-600">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    {...field}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm bg-gray-50 sm:text-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={otpForm.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-blue-600">
                  OTP Code
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter OTP"
                    {...field}
                    className="mt-1 block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStep("login");
                // Clean up stored user type when going back
                localStorage.removeItem("userType");
              }}
              disabled={isLoading}
              className="flex-1 justify-center rounded-md border border-gray-300 px-4 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  // Login Form
  return (
    <Form {...loginForm}>
      <form
        onSubmit={loginForm.handleSubmit(onLoginSubmit)}
        className="space-y-6 text-left"
      >
        <FormField
          control={loginForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-blue-600">
                Email
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="john@company.com"
                  {...field}
                  className="mt-1 block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={loginForm.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-blue-600">
                Password
              </FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="************"
                    {...field}
                    className="mt-1 block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
