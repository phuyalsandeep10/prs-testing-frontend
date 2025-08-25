"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { NationalitySelector } from "@/components/ui/nationality-selector";
import { SearchableCountrySelect } from "@/components/ui/searchable-country-select";
import { type Client } from "@/lib/types/roles";
import { useUpdateClient } from "@/hooks/api";

const formSchema = z.object({
  client_name: z.string().min(1, "Client name is required"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(1, "Phone number is required"),
  nationality: z.string().min(1, "Nationality is required"),
  status: z.enum(["clear", "pending", "bad_debt"]).optional(),
  satisfaction: z.enum(["neutral", "satisfied", "unsatisfied"]).optional(),
  remarks: z.string().optional(),
});

interface EditClientFormProps {
  client: Client;
  onClose: () => void;
  onClientUpdated?: (updatedClient: Client) => void;
}

export default function EditClientForm({
  client,
  onClose,
  onClientUpdated,
}: EditClientFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = React.useState("+977");
  const [phoneDigits, setPhoneDigits] = React.useState("");
  const updateClientMutation = useUpdateClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_name: client.client_name || "",
      email: client.email || "",
      phone_number: "",
      nationality: client.nationality || "",
      status:
        client.status &&
        ["clear", "pending", "bad_debt"].includes(client.status)
          ? (client.status as "clear" | "pending" | "bad_debt")
          : "clear",
      satisfaction:
        client.satisfaction &&
        ["neutral", "satisfied", "unsatisfied"].includes(client.satisfaction)
          ? (client.satisfaction as "neutral" | "satisfied" | "unsatisfied")
          : "neutral",
      remarks: client.remarks || "",
    },
  });

  // Initialize country code and phone number from client data
  React.useEffect(() => {
    console.log("EditClientForm - Initializing with client phone:", client.phone_number);
    if (client.phone_number) {
      // Extract last 10 digits as phone number, rest as country code
      const phoneStr = client.phone_number.replace(/\D/g, ''); // Remove all non-digits
      if (phoneStr.length >= 10) {
        const digits = phoneStr.slice(-10); // Last 10 digits
        const countryCode = '+' + phoneStr.slice(0, -10); // Everything before last 10 digits with +
        console.log("EditClientForm - Separating phone:", { 
          full: client.phone_number, 
          phoneStr,
          countryCode, 
          digits,
          beforeStateUpdate: { selectedCountryCode, phoneDigits }
        });
        setSelectedCountryCode(countryCode);
        setPhoneDigits(digits);
        form.setValue('phone_number', digits);
        console.log("EditClientForm - After state update - country code:", countryCode, "digits:", digits);
      } else {
        // If less than 10 digits, treat entire string as digits
        const digits = phoneStr || '';
        console.log("EditClientForm - Less than 10 digits, using all as digits:", digits);
        setPhoneDigits(digits);
        form.setValue('phone_number', digits);
      }
    }
  }, [client.phone_number, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const payload = {
        id: client.id,
        client_name: values.client_name,
        email: values.email,
        nationality: values.nationality,
        phone_number: `${selectedCountryCode}${phoneDigits}`,
        status: values.status,
        satisfaction: values.satisfaction,
        remarks: values.remarks || "",
      };
      const updatedClient = await updateClientMutation.mutateAsync(payload);
      toast.success("Client updated successfully!");
      if (onClientUpdated) {
        onClientUpdated(updatedClient);
      }
      onClose();
    } catch (error: any) {
      console.error("Failed to update client:", error);
      if (error.status === 404) {
        toast.error(
          "Client not found. The client may have been deleted or you don't have permission to edit it. Please refresh the page.",
        );
      } else if (error.status === 401) {
        toast.error("Authentication failed. Please login again.");
      } else if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.email) {
          toast.error(`Email Error: ${errorData.email[0]}`);
        } else if (errorData.phone_number) {
          toast.error(`Phone Error: ${errorData.phone_number[0]}`);
        } else if (errorData.client_name) {
          toast.error(`Name Error: ${errorData.client_name[0]}`);
        } else if (errorData.nationality) {
          toast.error(`Nationality Error: ${errorData.nationality[0]}`);
        } else {
          const firstKey = Object.keys(errorData)[0];
          const firstMsg = errorData[firstKey]?.[0] || error.message;
          toast.error(`${firstKey}: ${firstMsg}`);
        }
      } else {
        toast.error(
          error.message || "Failed to update client. Please try again.",
        );
      }
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

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div className="flex flex-col h-full">
      {/* Form Body - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Contact Information Section */}
            <div>
              <h3 className="text-base sm:text-[16px] font-medium text-gray-900 mb-4">
                Contact Information
              </h3>
            </div>
            {/* Client Name */}
            <FormField
              control={form.control}
              name="client_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-[#4F46E5] mb-2 block">
                    Client Name<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-10 sm:h-[48px] w-full border-2 border-[#4F46E5] focus:border-[#4F46E5] focus:ring-[#4F46E5] text-sm sm:text-[16px] rounded-lg"
                      placeholder="Abinash Gokte Babu Tiwari"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-[12px] text-red-500 mt-1" />
                </FormItem>
              )}
            />
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-[#4F46E5] mb-2 block">
                    Email<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className="h-10 sm:h-[48px] w-full border-2 border-[#4F46E5] focus:border-[#4F46E5] focus:ring-[#4F46E5] text-sm sm:text-[16px] rounded-lg"
                      placeholder="Abinashgoktebabutiwari666@gmail.com"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-[12px] text-red-500 mt-1" />
                </FormItem>
              )}
            />
            {/* Contact Number and Nationality Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-[#4F46E5] mb-2 block">
                      Contact Number
                      <span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="flex">
                        <SearchableCountrySelect
                          value={selectedCountryCode}
                          onChange={(newCountryCode) => {
                            console.log("Country code changed to:", newCountryCode);
                            setSelectedCountryCode(newCountryCode);
                          }}
                          disabled={isLoading}
                          className="w-[150px]"
                        />
                        <Input
                          type="tel"
                          className="h-10 sm:h-[48px] border-2 border-[#4F46E5] focus:border-[#4F46E5] focus:ring-[#4F46E5] text-sm sm:text-[16px] rounded-l-none border-l-0 rounded-r-[6px]"
                          placeholder="9807057526"
                          value={phoneDigits}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 15);
                            console.log("Phone digits changed to:", digits);
                            setPhoneDigits(digits);
                            field.onChange(digits);
                          }}
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs sm:text-[12px] text-red-500 mt-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-[#4F46E5] mb-2 block">
                      Nationality<span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <NationalitySelector
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Select nationality"
                        disabled={isLoading}
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-[12px] text-red-500 mt-1" />
                  </FormItem>
                )}
              />
            </div>
            {/* Additional Notes Section */}
            <div className="pt-4">
              <h3 className="text-base sm:text-[16px] font-medium text-gray-900 mb-4">
                Additional Notes
              </h3>
            </div>
            {/* Remarks */}
            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-[#4F46E5] mb-2 block">
                    Remarks
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[100px] sm:min-h-[120px] border-2 border-[#4F46E5] focus:border-[#4F46E5] focus:ring-[#4F46E5] text-sm sm:text-[16px] rounded-lg resize-none"
                      placeholder="Enter remarks"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-xs sm:text-[12px] text-red-500 mt-1" />
                </FormItem>
              )}
            />
            {/* Status and Satisfaction Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-[#4F46E5] mb-2 block">
                      Status<span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 sm:h-[48px] border-2 border-[#4F46E5] focus:border-[#4F46E5] w-full text-sm sm:text-base">
                          <SelectValue placeholder="Clear" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem
                          value="clear"
                          className="text-green-600 font-medium"
                        >
                          Clear
                        </SelectItem>
                        <SelectItem
                          value="pending"
                          className="text-orange-600 font-medium"
                        >
                          Pending
                        </SelectItem>
                        <SelectItem
                          value="bad_debt"
                          className="text-red-600 font-medium"
                        >
                          Bad Debt
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs sm:text-[12px] text-red-500 mt-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="satisfaction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-[#4F46E5] mb-2 block">
                      Satisfaction<span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 sm:h-[48px] border-2 border-[#4F46E5] focus:border-[#4F46E5] w-full text-sm sm:text-base">
                          <SelectValue placeholder="Neutral" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem
                          value="neutral"
                          className="text-gray-600 font-medium"
                        >
                          Neutral
                        </SelectItem>
                        <SelectItem
                          value="satisfied"
                          className="text-green-600 font-medium"
                        >
                          Satisfied
                        </SelectItem>
                        <SelectItem
                          value="unsatisfied"
                          className="text-red-600 font-medium"
                        >
                          Unsatisfied
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs sm:text-[12px] text-red-500 mt-1" />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </div>
      {/* Footer with Blue Gradient Background */}
      <div className="px-4 sm:px-6 py-6 bg-gradient-to-r from-[#4F46E5] via-[#7C8FE8] to-[#A8B5EB] flex-shrink-0 mt-auto border-t-0">
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-4 sm:px-8 py-2 h-10 sm:h-[44px] text-sm sm:text-[14px] font-medium rounded-lg"
          >
            Clear
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
            className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-4 sm:px-8 py-2 h-10 sm:h-[44px] text-sm sm:text-[14px] font-medium rounded-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Update Client"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
