"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import type { Client } from "@/lib/types/roles";
import { clientApi } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Form schemas for different variants
const addClientSchema = z.object({
  client_name: z.string().min(1, "Client name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(10, "Contact number must be at least 10 digits"),
  nationality: z.string().min(1, "Nationality is required"),
  remarks: z.string().optional(),
});

const editClientSchema = z.object({
  client_name: z.string().min(1, "Client name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(10, "Contact number must be at least 10 digits"),
  nationality: z.string().min(1, "Nationality is required"),
  status: z.enum(["clear", "pending", "bad_debt"]).optional(),
  satisfaction: z.enum(["excellent", "good", "average", "poor"]).optional(),
  remarks: z.string().optional(),
});

const salespersonClientSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  email: z.string().email("Invalid email address"),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
  nationality: z.string().min(1, "Nationality is required"),
  remarks: z.string().optional(),
});

type FormVariant = 'add' | 'edit' | 'salesperson';
type FormMode = 'modal' | 'standalone';

interface ClientFormWrapperProps {
  variant: FormVariant;
  mode?: FormMode;
  client?: Client; // For edit mode
  onClose?: () => void;
  onClientAdded?: (newClient: Client) => void;
  onClientUpdated?: (updatedClient: Client) => void;
  onSuccess?: () => void; // For salesperson variant
}

export function ClientFormWrapper({ 
  variant, 
  mode = 'modal',
  client, 
  onClose, 
  onClientAdded, 
  onClientUpdated,
  onSuccess 
}: ClientFormWrapperProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);

  // Determine schema based on variant
  const getSchema = () => {
    switch (variant) {
      case 'add': return addClientSchema;
      case 'edit': return editClientSchema;
      case 'salesperson': return salespersonClientSchema;
      default: return addClientSchema;
    }
  };

  const schema = getSchema();

  React.useEffect(() => {
    if (mode === 'modal') {
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [mode]);

  // Get default values based on variant and mode
  const getDefaultValues = () => {
    if (variant === 'edit' && client) {
      return {
        client_name: client.client_name || "",
        email: client.email || "",
        phone_number: client.phone_number || "",
        nationality: client.nationality || "",
        status: client.payment_status && ["clear", "pending", "bad_debt"].includes(client.payment_status) 
          ? client.payment_status as "clear" | "pending" | "bad_debt" 
          : "clear",
        satisfaction: client.satisfaction && ["excellent", "good", "average", "poor"].includes(client.satisfaction) 
          ? client.satisfaction as "excellent" | "good" | "average" | "poor" 
          : "average",
        remarks: client.remarks || "",
      };
    }
    
    if (variant === 'salesperson') {
      return {
        clientName: "",
        email: "",
        contactNumber: "",
        nationality: "",
        remarks: "",
      };
    }

    return {
      client_name: "",
      email: "",
      phone_number: "",
      nationality: "",
      remarks: "",
    };
  };

  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(),
  });

  // Handle submission based on variant
  const onSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      if (variant === 'salesperson') {
        // Salesperson variant - use mutation pattern
        console.log("Salesperson client data:", values);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success("Client saved successfully!");
        form.reset();
        if (onSuccess) {
          onSuccess();
        }
        if (onClose) {
          onClose();
        }
        return;
      }

      // Prepare payload for add/edit
      const phoneRaw = values.phone_number || values.contactNumber || "";
      const payload: any = {
        name: values.client_name || values.clientName,
        email: values.email,
        nationality: values.nationality,
        remarks: values.remarks || '',
        phoneNumber: phoneRaw.trim().startsWith('+') ? phoneRaw.trim() : `+977${phoneRaw.trim()}`,
      };

      if (variant === 'edit' && values.status) {
        payload.status = values.status;
      }
      if (variant === 'edit' && values.satisfaction) {
        payload.satisfaction = values.satisfaction;
      }

      let response;
      if (variant === 'edit' && client) {
        response = await clientApi.update({ id: client.id, ...payload });
        if (response.success && response.data) {
          toast.success("Client updated successfully!");
          const apiObj: any = response.data;
          const mapped: Client = {
            ...(apiObj as any),
            client_name: apiObj.name,
            phone_number: apiObj.phoneNumber,
            created_at: apiObj.createdAt || client.created_at,
          };
          if (onClientUpdated) {
            onClientUpdated(mapped);
          }
        }
      } else {
        response = await clientApi.create(payload);
        if (response.success && response.data) {
          toast.success("Client created successfully!");
          const apiClientObj: any = response.data;
          const mappedClient: Client = {
            ...(apiClientObj as any),
            client_name: apiClientObj.name,
            phone_number: apiClientObj.phoneNumber,
            created_at: apiClientObj.createdAt || new Date().toISOString(),
          };
          if (onClientAdded) {
            onClientAdded(mappedClient);
          }
        }
      }

      if (response && !response.success) {
        toast.error(response.message || "Operation failed.");
        return;
      }

      handleClose();
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (mode === 'modal') {
      setIsVisible(false);
      setTimeout(() => {
        if (onClose) onClose();
      }, 300);
    } else if (onClose) {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleClear = () => {
    if (!isLoading) {
      form.reset();
      if (variant === 'salesperson') {
        console.log("Form cleared");
      } else {
        toast.info("Form cleared");
      }
    }
  };

  // Get styling configuration based on variant
  const getStyles = () => {
    const baseStyles = {
      headerTitle: variant === 'edit' ? "Edit Client Details" : "Add New Client",
      headerColor: variant === 'salesperson' ? "text-[#465FFF]" : "text-[#4F46E5]",
      labelColor: variant === 'salesperson' ? "text-[#31323A]" : "text-[#4F46E5]",
      inputBorder: variant === 'salesperson' ? "border-gray-300 shadow-[0_0_4px_#8393FC]" : "border-2 border-[#4F46E5]",
      inputFocus: variant === 'salesperson' ? "focus:border-gray-300" : "focus:border-[#4F46E5] focus:ring-[#4F46E5]",
      clearBtnColor: variant === 'salesperson' ? "bg-[#F61818]" : "bg-[#EF4444] hover:bg-[#DC2626]",
      saveBtnColor: variant === 'salesperson' ? "bg-[#009959]" : "bg-[#22C55E] hover:bg-[#16A34A]",
      footerBg: variant === 'salesperson' 
        ? (mode === 'modal' ? "" : "bg-gradient-to-r from-[#0C29E3] via-[#929FF4] to-[#C6CDFA]")
        : "bg-gradient-to-r from-[#4F46E5] via-[#7C8FE8] to-[#A8B5EB]",
    };
    return baseStyles;
  };

  const styles = getStyles();

  // Render form fields based on variant
  const renderFormFields = () => (
    <>
      {/* Contact Information Section */}
      <div>
        <h3 className="text-[16px] font-medium text-gray-900 mb-4">
          Contact Information
        </h3>
      </div>

      {/* Client Name */}
      <FormField
        control={form.control}
        name={variant === 'salesperson' ? "clientName" : "client_name"}
        render={({ field }) => (
          <FormItem>
            <FormLabel className={`text-[14px] font-medium ${styles.labelColor} mb-2 block`}>
              Client Name<span className="text-red-500 ml-1">*</span>
            </FormLabel>
            <FormControl>
              <Input
                className={`h-[48px] ${styles.inputBorder} ${styles.inputFocus} text-[16px] rounded-lg`}
                placeholder={variant === 'salesperson' ? "Client Name" : "Abinash Gokte Babu Tiwari"}
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
            <FormLabel className={`text-[14px] font-medium ${styles.labelColor} mb-2 block`}>
              Email<span className="text-red-500 ml-1">*</span>
            </FormLabel>
            <FormControl>
              <Input
                type="email"
                className={`h-[48px] ${styles.inputBorder} ${styles.inputFocus} text-[16px] rounded-lg`}
                placeholder={variant === 'salesperson' ? "email@example.com" : "Abinashgoktebabutiwari666@gmail.com"}
                {...field}
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage className="text-[12px] text-red-500 mt-1" />
          </FormItem>
        )}
      />

      {/* Contact Number and Nationality */}
      <div className={variant === 'salesperson' ? "flex gap-4" : "grid grid-cols-2 gap-4"}>
        <FormField
          control={form.control}
          name={variant === 'salesperson' ? "contactNumber" : "phone_number"}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={`text-[14px] font-medium ${styles.labelColor} mb-2 block`}>
                Contact Number<span className="text-red-500 ml-1">*</span>
              </FormLabel>
              {variant !== 'salesperson' ? (
                <div className="flex items-center gap-0">
                  <div className="w-[48px] h-[48px] border-2 border-[#4F46E5] rounded-l-lg flex items-center justify-center bg-white border-r-0">
                    <span className="text-lg">🇳🇵</span>
                  </div>
                  <FormControl>
                    <Input
                      className="h-[48px] border-2 border-[#4F46E5] border-l-0 focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-l-none rounded-r-lg"
                      placeholder="9800000000"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                </div>
              ) : (
                <FormControl>
                  <Input
                    type="tel"
                    className={`h-[48px] ${styles.inputBorder} ${styles.inputFocus} text-[16px] rounded-lg w-[186px]`}
                    placeholder="9800000000"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
              )}
              <FormMessage className="text-[12px] text-red-500 mt-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nationality"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={`text-[14px] font-medium ${styles.labelColor} mb-2 block`}>
                Nationality<span className="text-red-500 ml-1">*</span>
              </FormLabel>
              {variant !== 'salesperson' ? (
                <div className="flex items-center gap-0">
                  <div className="w-[48px] h-[48px] border-2 border-[#4F46E5] rounded-l-lg flex items-center justify-center bg-white border-r-0">
                    <span className="text-lg">🇳🇵</span>
                  </div>
                  <FormControl>
                    <Input
                      className="h-[48px] border-2 border-[#4F46E5] border-l-0 focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-l-none rounded-r-lg"
                      placeholder="Nepalese"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                </div>
              ) : (
                <FormControl>
                  <Input
                    className={`h-[48px] ${styles.inputBorder} ${styles.inputFocus} text-[16px] rounded-lg w-[186px]`}
                    placeholder="Nepalese"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
              )}
              <FormMessage className="text-[12px] text-red-500 mt-1" />
            </FormItem>
          )}
        />
      </div>

      {/* Additional Notes Section */}
      <div className="pt-4">
        <h3 className="text-[16px] font-medium text-gray-900 mb-4">
          Additional Notes
        </h3>
      </div>

      {/* Remarks */}
      <FormField
        control={form.control}
        name="remarks"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={`text-[14px] font-medium ${styles.labelColor} mb-2 block`}>
              Remarks
            </FormLabel>
            <FormControl>
              <Textarea
                className={`min-h-[120px] ${styles.inputBorder} ${styles.inputFocus} text-[16px] rounded-lg resize-none ${variant === 'salesperson' ? 'h-[113px]' : ''}`}
                placeholder="Enter remarks"
                {...field}
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage className="text-[12px] text-red-500 mt-1" />
          </FormItem>
        )}
      />

      {/* Status and Satisfaction (Edit mode only) */}
      {variant === 'edit' && (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                  Status<span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger className="h-[48px] border-2 border-[#4F46E5] focus:border-[#4F46E5] w-full">
                      <SelectValue placeholder="Clear" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="clear" className="text-green-600 font-medium">
                      Clear
                    </SelectItem>
                    <SelectItem value="pending" className="text-orange-600 font-medium">
                      Pending
                    </SelectItem>
                    <SelectItem value="bad_debt" className="text-red-600 font-medium">
                      Bad Debt
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-[12px] text-red-500 mt-1" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="satisfaction"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                  Satisfaction<span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                  <FormControl>
                    <SelectTrigger className="h-[48px] border-2 border-[#4F46E5] focus:border-[#4F46E5] w-full">
                      <SelectValue placeholder="Neutral" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="excellent" className="text-green-600 font-medium">
                      Excellent
                    </SelectItem>
                    <SelectItem value="good" className="text-orange-600 font-medium">
                      Good
                    </SelectItem>
                    <SelectItem value="average" className="text-orange-600 font-medium">
                      Average
                    </SelectItem>
                    <SelectItem value="poor" className="text-red-600 font-medium">
                      Poor
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-[12px] text-red-500 mt-1" />
              </FormItem>
            )}
          />
        </div>
      )}
    </>
  );

  // Render buttons based on variant
  const renderButtons = () => (
    <div className="flex justify-end gap-3">
      <Button
        type="button"
        onClick={handleClear}
        disabled={isLoading}
        className={`${styles.clearBtnColor} text-white px-8 py-2 h-[44px] text-[14px] font-medium rounded-lg ${variant === 'salesperson' ? 'w-[83px]' : ''}`}
      >
        Clear
      </Button>
      <Button
        onClick={form.handleSubmit(onSubmit)}
        disabled={isLoading}
        className={`${styles.saveBtnColor} text-white px-8 py-2 h-[44px] text-[14px] font-medium rounded-lg ${variant === 'salesperson' ? 'w-[119px]' : ''}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {variant === 'edit' ? "Updating..." : variant === 'salesperson' ? "Updating..." : "Saving..."}
          </>
        ) : (
          variant === 'edit' ? "Update Client" : variant === 'salesperson' ? "Save Client" : "Save Client"
        )}
      </Button>
    </div>
  );

  // Salesperson standalone mode
  if (variant === 'salesperson' && mode === 'standalone') {
    return (
      <div className="max-w-md mx-auto pt-6 bg-white rounded-lg shadow-md pl-6">
        <h2 className="text-[20px] font-bold mb-6 text-[#465FFF] flex item-center justify-between pr-6">
          Add New Client
          <svg
            className="mt-2"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20ZM10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM10 8.5858L12.8284 5.75736L14.2426 7.17157L11.4142 10L14.2426 12.8284L12.8284 14.2426L10 11.4142L7.17157 14.2426L5.75736 12.8284L8.5858 10L5.75736 7.17157L7.17157 5.75736L10 8.5858Z"
              fill="#465FFF"
            />
          </svg>
        </h2>
        <hr className="mb-6" />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {renderFormFields()}
            <div className={`flex justify-end gap-4 mt-3 ${styles.footerBg} p-4 -ml-6`}>
              {renderButtons()}
            </div>
          </form>
        </Form>
      </div>
    );
  }

  // Salesperson modal mode
  if (variant === 'salesperson' && mode === 'modal') {
    return (
      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {renderFormFields()}
            <div className="flex justify-end gap-4 mt-3 pt-6">
              {renderButtons()}
            </div>
          </form>
        </Form>
      </div>
    );
  }

  // Add/Edit modal mode
  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex z-[99999]"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 99999,
      }}
    >
      <div
        className="ml-auto w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-[100000] flex flex-col"
        style={{
          transform: isVisible ? "translateX(0)" : "translateX(100%)",
          zIndex: 100000,
          height: "100vh",
          minHeight: "100vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className={`text-[20px] font-semibold ${styles.headerColor}`}>
              {styles.headerTitle}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {renderFormFields()}
            </form>
          </Form>
        </div>

        {/* Footer */}
        <div className={`px-6 py-6 ${styles.footerBg} flex-shrink-0 mt-auto border-t-0`}>
          {renderButtons()}
        </div>
      </div>
    </div>
  );
} 