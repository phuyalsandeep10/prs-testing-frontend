"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuth, useUI } from "@/stores";
import { apiClient } from "@/lib/api";
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
      const response = await apiClient.post<LoginResponse>(
        "/auth/login/direct/",
        credentials
      );
      return response.data!;
    },
    onError: (error: any) => {
      addNotification({
        type: "error",
        title: "Login Failed",
        message: error.message || "Invalid credentials. Please try again.",
      });
    },
  });
};

const useOTPVerifyMutation = () => {
  const { login } = useAuth();
  const { addNotification } = useUI();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ email, otp }: { email: string; otp: string }): Promise<OTPVerifyResponse> => {
      const response = await apiClient.post<OTPVerifyResponse>(
        "/auth/login/verify/",
        { email, otp }
      );
      return response.data!;
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
      addNotification({
        type: "error",
        title: "OTP Verification Failed",
        message: error.message || "Invalid OTP. Please try again.",
      });
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
      const result = await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });
      if (result.requires_otp) {
        setUserEmail(values.email);
        setStep("otp");
      } else if (result.token && result.user) {
        login(result.token, result.user);
        addNotification({
          type: "success",
          title: "Login Successful",
          message: `Welcome back, ${result.user.first_name || result.user.email}!`,
        });
        handleSuccessfulLoginRedirect(result.user);
      } else if (result.requires_password_change && result.temporary_token) {
        localStorage.setItem("tempToken", result.temporary_token);
        localStorage.setItem("tempEmail", values.email);
        router.push("/change-password");
      }
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error("Login error:", error);
    }
  };

  // Handle OTP verification
  const onOtpSubmit = async (values: z.infer<typeof otpSchema>) => {
    try {
      await otpVerifyMutation.mutateAsync({
        email: values.email,
        otp: values.otp,
      });
    } catch (error) {
      // Error handling is done in the mutation
      console.error("OTP verification error:", error);
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
              onClick={() => setStep("login")}
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
