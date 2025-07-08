"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

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
import { UserRole } from "@/lib/types/roles";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const otpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  otp: z.string().min(6, "OTP must be at least 6 characters"),
});

export default function LoginForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string>("");
  const [step, setStep] = React.useState<"login" | "otp">("login"); // Track login step
  const [userEmail, setUserEmail] = React.useState<string>(""); // Store email for OTP step
  const [userType, setUserType] = React.useState<"super_admin" | "org_admin">(
    "org_admin"
  ); // Track user type for OTP
  const router = useRouter();
  const { login } = useAuth();

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

  // Handle regular login submission
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setError("");

    try {
      console.log("🔍 Attempting login for:", values.email);

      // Try regular login first - the backend will tell us what to do
      const apiUrl = `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
      }/auth/login/`;
      console.log("🌐 Making login request to:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const data = await response.json();
      console.log("Login response status:", response.status);
      console.log(
        "Login response headers:",
        Object.fromEntries(response.headers.entries())
      );
      console.log("Login response data:", data);

      if (response.status === 200) {
        // Regular successful login (status 200)
        console.log("✅ Regular login successful:", data);
        handleSuccessfulLogin(data);
      } else if (response.status === 202) {
        // Special handling for different authentication requirements (202 = partial success)
        console.log(
          "🔄 Status 202 - Additional authentication required:",
          data
        );

        if (data.requires_otp) {
          console.log("🔐 OTP required for user type:", data.user_type);

          // Determine which OTP endpoint to use
          const otpEndpoint =
            data.user_type === "super_admin"
              ? "super-admin/login"
              : "org-admin/login";

          // Send OTP request
          const otpResponse = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
            }/auth/${otpEndpoint}/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: values.email,
                password: values.password,
              }),
            }
          );

          if (otpResponse.ok) {
            const otpResult = await otpResponse.json();
            console.log("📧 OTP sent successfully:", otpResult);
            console.log("👤 Setting user type to:", data.user_type);
            console.log("📧 Setting user email to:", values.email);

            setUserEmail(values.email);
            setUserType(data.user_type);

            // Reset and set OTP form values properly
            otpForm.reset();
            otpForm.setValue("email", values.email);
            otpForm.setValue("otp", "");

            setStep("otp");
            setError("");
          } else {
            const otpError = await otpResponse.json();
            setError(otpError.error || "Failed to send OTP");
          }
        } else if (data.requires_password_change) {
          console.log("🔑 Password change required");
          // Redirect to password change page with temporary token
          localStorage.setItem("tempToken", data.temporary_token);
          localStorage.setItem("tempEmail", values.email);
          router.push("/change-password");
        }
      } else {
        // Login failed
        setError(data.error || "Login failed. Please check your credentials.");
      }
    } catch (error: any) {
      console.log("❌ Login error:", error);
      console.log("❌ Error type:", typeof error);
      console.log("❌ Error message:", error.message);
      console.log("❌ Error stack:", error.stack);

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        setError(
          "Cannot connect to server. Please check if the backend is running on http://localhost:8000"
        );
      } else if (error.message.includes("Failed to fetch")) {
        setError(
          "Network error. Please check your connection and ensure the backend server is running."
        );
      } else {
        setError(
          `Login failed: ${error.message || "Please check your credentials."}`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const onOtpSubmit = async (values: z.infer<typeof otpSchema>) => {
    setIsLoading(true);
    setError("");

    try {
      // Determine which verification endpoint to use based on user type
      const verifyEndpoint =
        userType === "super_admin" ? "super-admin/verify" : "org-admin/verify";

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
        }/auth/${verifyEndpoint}/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: values.email,
            otp: values.otp,
          }),
        }
      );

      const result = await response.json();
      console.log("🔍 OTP verification response status:", response.status);
      console.log("🔍 OTP verification response data:", result);

      if (response.ok) {
        // Check if password change is required
        if (result.requires_password_change) {
          console.log("🔑 Password change required after OTP verification");
          console.log(
            "🎫 Temporary token received:",
            result.temporary_token ? "Yes" : "No"
          );
          console.log("📧 Email for temp storage:", values.email);

          if (result.temporary_token) {
            localStorage.setItem("tempToken", result.temporary_token);
            localStorage.setItem("tempEmail", values.email);
            console.log("✅ Temporary credentials stored successfully");
            router.push("/change-password");
            return;
          } else {
            console.error("❌ No temporary token received from server");
            setError(
              "No temporary token received. Please try logging in again."
            );
            return;
          }
        }

        // Store the token and user data
        localStorage.setItem("authToken", result.token);

        // Handle different user types
        if (userType === "super_admin") {
          const userData = {
            id: result.user_id,
            email: result.email,
            role: result.role || "super-admin",
          };
          localStorage.setItem("user", JSON.stringify(userData));
          console.log(
            "OTP verification successful, navigating to super-admin dashboard"
          );
          router.push("/super-admin");
        } else {
          // Organization admin
          localStorage.setItem("user", JSON.stringify(result.user));
          console.log(
            "OTP verification successful, navigating to org-admin dashboard"
          );
          router.push("/org-admin");
        }
      } else {
        setError(result.error || "OTP verification failed.");
      }
    } catch (error: any) {
      setError("OTP verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessfulLogin = (data: any) => {
    console.log("🎯 handleSuccessfulLogin called with:", data);
    console.log("🔍 Full data structure:", JSON.stringify(data, null, 2));

    // Store the token
    if (data.token) {
      localStorage.setItem("authToken", data.token);
    }

    const user = {
      id: data.user_id,
      username: data.username,
      email: data.email,
      role: {
        name: (data.role || "unknown") as UserRole,
        permissions: [], // You can fetch real permissions later if needed
      },
      organization: data.organization,
    };
  
    }

    // Check if user data exists
    if (!data.user) {
      console.error("❌ No user data in response:", data);
      setError("Login response missing user data. Please try again.");
      return;
    }

    // Use the login function from AuthContext
    login(data.token, user);

    const userRole = (data.role || "unknown")

    // Get role and permissions for auth context - ensure rawRole is always a string
    // Fix role extraction
    const rawRole =
      typeof data.user?.role === "object"
        ? data.user.role.name
        : data.user.role_name || "unknown";

    // Normalize role
    const userRole = (typeof rawRole === "string" ? rawRole : "unknown")
      .toLowerCase()
      .replace(/\s+/g, "-") as UserRole;

    console.log("User role identified as:", userRole);

    switch (userRole) {
      case "super-admin":
        router.push("/super-admin");
        break;
      case "org-admin":
        router.push("/org-admin");
        break;
      case "salesperson":
        router.push("/salesperson");
        break;
      case "supervisor":
        router.push("/supervisor/team-lead");
        break;
      case "team-member":
        router.push("/team-member");
        break;
      case "verifier":
        router.push("/verifier");
        break;
      default:
        setError(`Unknown user role: ${userRole}`);
        console.error(`Unknown user role: ${userRole}`);
        break;
    }
  };
  

  if (step === "otp") {
    // OTP Verification Form
    return (
      <Form {...otpForm}>
        <form
          onSubmit={otpForm.handleSubmit(onOtpSubmit)}
          className="space-y-6 text-left"
        >
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
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
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}
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
