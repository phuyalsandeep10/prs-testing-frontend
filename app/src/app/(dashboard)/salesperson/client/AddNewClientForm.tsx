"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  email: z.string().email("Invalid email address"),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
  nationality: z.string().min(1, "Nationality is required"),
  remarks: z.string().optional(),
});

interface AddNewClientFormProps {
  onClose: () => void;
  onFormSubmit?: () => void;
}

export default function AddNewClientForm({ onClose, onFormSubmit }: AddNewClientFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Trigger slide-in animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      email: "",
      contactNumber: "",
      nationality: "",
      remarks: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Form values:", values);
      toast.success("Client created successfully!");
      form.reset();
      if (onFormSubmit) {
        onFormSubmit();
      }
      handleClose();
    } catch (error) {
      console.error("Failed to create client:", error);
      toast.error("Failed to create client. Please try again.");
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

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex z-[99999]"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 99999 }}
    >
      <div 
        className="ml-auto w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-[100000] flex flex-col"
        style={{ 
          transform: isVisible ? 'translateX(0)' : 'translateX(100%)', 
          zIndex: 100000,
          height: '100vh',
          minHeight: '100vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Blue Title */}
        <div className="px-6 py-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-semibold text-[#4F46E5]">
              Add New Client
            </h2>
            <button 
              onClick={handleClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Contact Information Section */}
              <div>
                <h3 className="text-[16px] font-medium text-gray-900 mb-4">Contact Information</h3>
              </div>

              {/* Client Name */}
              <FormField
                control={form.control}
                name="clientName"
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
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                        Contact Number<span className="text-red-500 ml-1">*</span>
                      </FormLabel>
                      <div className="flex items-center gap-0">
                        <Select defaultValue="+977" disabled={isLoading}>
                          <SelectTrigger className="w-[80px] h-[48px] border-2 border-[#4F46E5] focus:border-[#4F46E5] rounded-r-none rounded-l-lg">
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
                            className="h-[48px] border-2 border-[#4F46E5] border-l-0 focus:border-[#4F46E5] focus:ring-[#4F46E5] text-[16px] rounded-l-none rounded-r-lg" 
                            disabled={isLoading} 
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="text-[12px] text-red-500 mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[14px] font-medium text-[#4F46E5] mb-2 block">
                        Nationality<span className="text-red-500 ml-1">*</span>
                      </FormLabel>
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
                      <FormMessage className="text-[12px] text-red-500 mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Additional Notes Section */}
              <div className="pt-4">
                <h3 className="text-[16px] font-medium text-gray-900 mb-4">Additional Notes</h3>
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
    </div>
  );
} 