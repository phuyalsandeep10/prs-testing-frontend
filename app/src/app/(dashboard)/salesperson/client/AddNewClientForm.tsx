"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import type { Client } from "@/lib/types/roles";
import { useCreateClient } from "@/hooks/api";

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

const formSchema = z.object({
  client_name: z.string().min(1, "Client name is required").regex(/^[A-Za-z\s]+$/, "Client name can only contain letters and spaces"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(1, "Phone number is required"),
  nationality: z.string().min(1, "Nationality is required"),
  remarks: z.string().optional(),
});

interface AddNewClientFormProps {
  onClose: () => void;
  onClientAdded?: (newClient: Client) => void;
}

export default function AddNewClientForm({
  onClose,
  onClientAdded,
}: AddNewClientFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const createClientMutation = useCreateClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_name: "",
      email: "",
      phone_number: "",
      nationality: "",
      remarks: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const payload = {
        client_name: values.client_name,
        email: values.email,
        nationality: values.nationality,
        remarks: values.remarks || "",
        phone_number: values.phone_number.trim(),
      };
      const newClient = await createClientMutation.mutateAsync(payload);
      toast.success("Client created successfully!");
      if (onClientAdded) {
        onClientAdded(newClient);
      }
      onClose();
    } catch (error: any) {
      console.error("Failed to create client:", error);
      if (error.status === 401) {
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
          error.message || "Failed to create client. Please try again.",
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
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Contact Information Section */}
            <div>
              <h3 className="text-[16px] font-medium text-gray-900 mb-4">
                Contact Information
              </h3>
            </div>
            {/* Client Name */}
            <FormField
              control={form.control}
              name="client_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                    Client Name<span className="text-red-500 ml-1">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-[48px] border-2 border-[#4F46E5] focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-lg"
                      placeholder="Abinash Gokte Babu Tiwari"
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
                      className="h-[48px] border-2 border-[#4F46E5] focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-lg"
                      placeholder="Abinashgoktebabutiwari666@gmail.com"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-[12px] text-red-500 mt-1" />
                </FormItem>
              )}
            />
            {/* Contact Number and Nationality Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => {
                  const [countryCode, setCountryCode] = React.useState('+977');
                  const [phoneNumber, setPhoneNumber] = React.useState('');
                  const [initialized, setInitialized] = React.useState(false);

                  // Initialize from field value only once
                  React.useEffect(() => {
                    if (!initialized && field.value) {
                      const match = field.value.match(/^(\+\d+)(.*)$/);
                      if (match) {
                        setCountryCode(match[1]);
                        setPhoneNumber(match[2] || '');
                      }
                      setInitialized(true);
                    } else if (!initialized) {
                      // Initialize with default values
                      setInitialized(true);
                    }
                  }, [field.value, initialized]);

                  const updateFormValue = (newCountryCode: string, newPhoneNumber: string) => {
                    const fullValue = newPhoneNumber ? `${newCountryCode}${newPhoneNumber}` : '';
                    field.onChange(fullValue);
                  };

                  const handleCountryChange = (newCountryCode: string) => {
                    setCountryCode(newCountryCode);
                    updateFormValue(newCountryCode, phoneNumber);
                  };

                  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const newPhoneNumber = e.target.value.replace(/\D/g, '').slice(0, 15);
                    setPhoneNumber(newPhoneNumber);
                    updateFormValue(countryCode, newPhoneNumber);
                  };

                  return (
                    <FormItem>
                      <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                        Contact Number
                        <span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="flex">
                          <Select 
                            value={countryCode}
                            disabled={isLoading}
                            onValueChange={handleCountryChange}
                          >
                            <SelectTrigger className="w-[120px] h-[48px] rounded-r-none border-r-0 border-2 border-[#4F46E5]">
                              <SelectValue placeholder="Country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="+977">🇳🇵 +977</SelectItem>
                              <SelectItem value="+91">🇮🇳 +91</SelectItem>
                              <SelectItem value="+1">🇺🇸 +1</SelectItem>
                              <SelectItem value="+44">🇬🇧 +44</SelectItem>
                              <SelectItem value="+86">🇨🇳 +86</SelectItem>
                              <SelectItem value="+61">🇦🇺 +61</SelectItem>
                              <SelectItem value="+33">🇫🇷 +33</SelectItem>
                              <SelectItem value="+49">🇩🇪 +49</SelectItem>
                              <SelectItem value="+81">🇯🇵 +81</SelectItem>
                              <SelectItem value="+82">🇰🇷 +82</SelectItem>
                              <SelectItem value="+65">🇸🇬 +65</SelectItem>
                              <SelectItem value="+971">🇦🇪 +971</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="tel"
                            className="h-[48px] border-2 border-[#4F46E5] focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-l-none border-l-0"
                            placeholder="9807057526"
                            value={phoneNumber}
                            disabled={isLoading}
                            onChange={handlePhoneChange}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[12px] text-red-500 mt-1" />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                      Nationality<span className="text-red-500 ml-1">*</span>
                    </FormLabel>
                    <FormControl>
                      <NationalitySelector
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Select nationality"
                        disabled={isLoading}
                      />
                    </FormControl>
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
                  <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                    Remarks
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[120px] border-2 border-[#4F46E5] focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-lg resize-none"
                      placeholder="Enter remarks"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-[12px] text-red-500 mt-1" />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
      {/* Footer with Blue Gradient Background - At Very Bottom */}
      <div className="px-6 py-6 bg-gradient-to-r from-[#4F46E5] via-[#7C8FE8] to-[#A8B5EB] flex-shrink-0 mt-auto border-t-0">
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-8 py-2 h-[44px] text-[14px] font-medium rounded-lg"
          >
            Clear
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
            className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-8 py-2 h-[44px] text-[14px] font-medium rounded-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Client"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
