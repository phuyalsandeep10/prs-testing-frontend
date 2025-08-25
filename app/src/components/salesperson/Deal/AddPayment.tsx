"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronDown, Paperclip } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

const AddPaymentSchema = z.object({
  paymentDate: z.string()
    .min(1, "📅 Payment date is required")
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return selectedDate <= today;
    }, {
      message: "📅 Payment date cannot be in the future. Please select today's date or earlier."
    }),
  receivedAmount: z.string()
    .min(1, "💰 Received amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "💰 Received amount must be a positive number (e.g., 1000.50)",
    }),
  chequeNo: z.string()
    .min(6, "📝 Cheque number must be at least 6 characters long")
    .max(20, "📝 Cheque number must not exceed 20 characters"),
  paymentType: z.string().min(1, "💳 Please select a payment type"),
  remarks: z.string().min(1, "📝 Payment remarks are required"),
});

type AddPaymentData = z.infer<typeof AddPaymentSchema>;

interface AddPaymentProps {
  dealId?: string | null;
  dealData?: {
    deal_value: number;
    currency: string;
    remaining_balance?: number;
  };
  onSave: (data: AddPaymentData) => void;
  onCancel: () => void;
}

const AddPayment: React.FC<AddPaymentProps> = ({
  dealId,
  dealData,
  onSave,
  onCancel,
}) => {
  const [selectedPaymentType, setSelectedPaymentType] = useState("Advance Payment");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("Receipt.png");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddPaymentData>({
    resolver: zodResolver(AddPaymentSchema),
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");

  const formatFieldError = (fieldName: string, message: string, fieldKey: string): string => {
    // Create user-friendly error messages based on field and error type
    const errorPatterns = {
      'required': `${fieldName} is required`,
      'invalid': `${fieldName} format is invalid`,
      'max_length': `${fieldName} is too long`,
      'min_length': `${fieldName} is too short`,
      'invalid_choice': `Invalid ${fieldName} selection`,
      'unique': `This ${fieldName} already exists`,
      'future_date': `${fieldName} cannot be in the future`,
      'past_date': `${fieldName} cannot be in the past`,
      'file_size': `${fieldName} file size is too large`,
      'file_type': `${fieldName} file type is not supported`,
      'decimal': `${fieldName} must be a valid number`,
      'positive': `${fieldName} must be a positive number`,
    };

    // Check for specific field-based custom messages
    if (fieldKey === 'receipt_file') {
      if (message.includes('malicious') || message.includes('suspicious')) {
        return "📄 Receipt file appears to be corrupted or invalid. Please try a different image (PNG, JPG) or PDF file.";
      }
      if (message.includes('size') || message.includes('large')) {
        return "📄 Receipt file is too large. Please use a file smaller than 10MB.";
      }
      if (message.includes('type') || message.includes('extension')) {
        return "📄 Receipt file type not supported. Please upload PNG, JPG, JPEG, or PDF files only.";
      }
    }

    if (fieldKey === 'payment_date') {
      if (message.includes('future')) {
        return "📅 Payment date cannot be in the future. Please select today's date or earlier.";
      }
      if (message.includes('invalid') || message.includes('format')) {
        return "📅 Invalid payment date format. Please select a valid date.";
      }
    }

    if (fieldKey === 'received_amount') {
      if (message.includes('positive') || message.includes('greater')) {
        return "💰 Received amount must be greater than zero.";
      }
      if (message.includes('decimal') || message.includes('number')) {
        return "💰 Received amount must be a valid number (e.g., 1000.50).";
      }
      if (message.includes('exceed') || message.includes('maximum')) {
        return "💰 Received amount exceeds the maximum allowed limit.";
      }
    }

    if (fieldKey === 'cheque_number') {
      if (message.includes('unique') || message.includes('exists')) {
        return "📝 This cheque number has already been used. Please enter a different cheque number.";
      }
      if (message.includes('length') || message.includes('character')) {
        return "📝 Cheque number must be between 6 and 20 characters long.";
      }
    }

    if (fieldKey === 'deal_id') {
      if (message.includes('required')) {
        return "🏷️ Deal ID is missing. Please refresh the page and try again.";
      }
      if (message.includes('not exist') || message.includes('not found')) {
        return "🏷️ Deal not found. Please refresh the page and try again.";
      }
    }

    // Try to match common error patterns
    const lowerMessage = message.toLowerCase();
    for (const [pattern, friendlyMessage] of Object.entries(errorPatterns)) {
      if (lowerMessage.includes(pattern)) {
        return friendlyMessage;
      }
    }

    // If no pattern matches, return the original message with field name
    return `${fieldName}: ${message}`;
  };

  const paymentTypes = [
    { value: "advance", label: "Advance Payment" },
    { value: "partial", label: "Partial Payment" },
    { value: "final", label: "Final Payment" },
  ];

  const submitPayment = async (data: AddPaymentData) => {
    if (!dealId) {
      toast.error("Deal ID is required");
      return;
    }

    if (!selectedFile) {
      toast.error("📄 Please upload a receipt file (PNG, JPG, JPEG, or PDF)", {
        duration: 4000,
        position: 'top-right',
      });
      setFileError("Receipt is required");
      return;
    }

    // Validate payment date is not in the future
    const selectedDate = new Date(data.paymentDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (selectedDate > today) {
      toast.error("📅 Payment date cannot be in the future. Please select today's date or earlier.", {
        duration: 5000,
        position: 'top-right',
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("📄 Only PNG, JPG, JPEG, and PDF files are allowed. Please select a different file.", {
        duration: 5000,
        position: 'top-right',
      });
      setFileError("Only PNG, JPG, JPEG, and PDF files are allowed");
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(1);
      toast.error(`📄 File size (${fileSizeMB}MB) is too large. Please use a file smaller than 10MB.`, {
        duration: 5000,
        position: 'top-right',
      });
      setFileError("File size must be less than 10MB");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Use deal_id as expected by the backend serializer
      formData.append("deal_id", dealId.toString());
      
      // Format date for Django DateField (YYYY-MM-DD format)
      formData.append("payment_date", data.paymentDate);
      
      formData.append("received_amount", data.receivedAmount);
      formData.append("cheque_number", data.chequeNo);
      formData.append("payment_category", data.paymentType);
      formData.append("payment_type", "cheque"); // Payment method
      formData.append("payment_remarks", data.remarks);

      if (selectedFile) {
        formData.append("receipt_file", selectedFile);
      }

      await apiClient.postMultipart("/deals/payments/", formData);

      toast.success("✅ Payment added successfully! The deal has been updated.", {
        duration: 4000,
        position: 'top-right',
      });
      onSave(data);
      onCancel();
    } catch (error: any) {
      console.log("Payment submission error:", error);
      
      // Handle different types of errors with specific user-friendly messages
      if (error.code === '400' || error.message?.includes('400')) {
        // Map backend field names to user-friendly names
        const fieldNameMap: { [key: string]: string } = {
          'deal_id': 'Deal ID',
          'payment_date': 'Payment Date',
          'received_amount': 'Received Amount',
          'cheque_number': 'Cheque Number',
          'payment_category': 'Payment Type',
          'payment_type': 'Payment Method',
          'payment_remarks': 'Remarks',
          'receipt_file': 'Receipt File',
          'non_field_errors': 'General Error'
        };

        let errorMessages: string[] = [];
        
        if (error.details && typeof error.details === 'object') {
          // Process each field error with specific messages
          Object.entries(error.details).forEach(([field, messages]) => {
            const fieldDisplayName = fieldNameMap[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            if (messages && Array.isArray(messages)) {
              messages.forEach((message: string) => {
                if (message) {
                  errorMessages.push(formatFieldError(fieldDisplayName, message, field));
                }
              });
            } else if (messages && typeof messages === 'string') {
              errorMessages.push(formatFieldError(fieldDisplayName, messages, field));
            }
          });
        } else if (error.details && typeof error.details === 'string') {
          errorMessages.push(error.details);
        } else if (error.message && !error.message.includes('400')) {
          errorMessages.push(error.message);
        }

        // Show multiple error messages as separate toasts for better visibility
        if (errorMessages.length === 0) {
          errorMessages = ["Invalid data format. Please check your inputs."];
        }

        // Show the first 3 errors as separate toasts to avoid overwhelming the user
        errorMessages.slice(0, 3).forEach((message, index) => {
          setTimeout(() => {
            toast.error(message, {
              duration: 6000, // Longer duration for error messages
              position: 'top-right',
            });
          }, index * 100); // Slight delay between messages
        });

        // If there are more than 3 errors, show a summary
        if (errorMessages.length > 3) {
          setTimeout(() => {
            toast.error(`And ${errorMessages.length - 3} more validation error(s). Please review all fields.`, {
              duration: 4000,
              position: 'top-right',
            });
          }, 300);
        }

      } else if (error.code === 'TIMEOUT' || error.message?.includes('timeout')) {
        toast.error("⏰ Request timed out. Please check your connection and try again.", {
          duration: 5000,
        });
      } else if (error.code === '401' || error.message?.includes('401')) {
        toast.error("🔐 Authentication failed. Please log in again.", {
          duration: 5000,
        });
      } else if (error.code === '403' || error.message?.includes('403')) {
        toast.error("🚫 You don't have permission to add payments to this deal.", {
          duration: 5000,
        });
      } else if (error.code === '404' || error.message?.includes('404')) {
        toast.error("❓ Deal not found. Please refresh the page and try again.", {
          duration: 5000,
        });
      } else if (error.code === '500' || error.message?.includes('500')) {
        toast.error("🔧 Server error occurred. Please try again in a few moments.", {
          duration: 6000,
        });
      } else if (error.message?.includes('Network Error') || error.message?.includes('fetch')) {
        toast.error("🌐 Network connection issue. Please check your internet and try again.", {
          duration: 5000,
        });
      } else {
        toast.error(error.message || "❌ Failed to add payment. Please try again.", {
          duration: 4000,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentTypeSelect = (type: { value: string; label: string }) => {
    setSelectedPaymentType(type.label);
    setValue("paymentType", type.value);
    setShowDropdown(false);
  };

  const handleClear = () => {
    reset();
    setSelectedPaymentType("Advance Payment");
    setSelectedFileName("Receipt.png");
    setSelectedFile(null);
    setFileError("");
    setShowDropdown(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setFileError("Only PNG, JPG, JPEG, and PDF files are allowed");
        setSelectedFileName("Receipt.png");
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setFileError("File size must be less than 10MB");
        setSelectedFileName("Receipt.png");
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Validate file name (no suspicious patterns)
      const suspiciousPatterns = /<[%?]|<script|javascript:|data:/i;
      if (suspiciousPatterns.test(file.name)) {
        setFileError("Invalid file name. Please rename your file.");
        setSelectedFileName("Receipt.png");
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      setSelectedFileName(file.name);
      setSelectedFile(file);
      setFileError("");
    } else {
      setSelectedFileName("Receipt.png");
      setSelectedFile(null);
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".payment-type-dropdown")) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="w-full bg-white h-full flex flex-col">
      <form
        onSubmit={handleSubmit(submitPayment)}
        className="h-full flex flex-col"
      >
        <div className="px-8 py-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 gap-8">
            {/* Column 1: Payment Date and Receipt */}
            <div className="space-y-6">
              <div>
                <label className="block text-[14px] font-medium text-gray-900 mb-2">
                  Payment Date<span className="text-red-500">*</span>
                </label>
                <input
                  {...register("paymentDate")}
                  type="date"
                  className="w-full h-[48px] px-4 border-2 border-[#4F46E5] rounded-lg text-[16px] focus:outline-none focus:border-[#4338CA] bg-white"
                />
                {errors.paymentDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.paymentDate.message)}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-[14px] font-medium text-gray-900 mb-2">
                  Attach Receipt<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".png,.jpg,.jpeg,.pdf"
                    id="attachReceipt"
                    onChange={handleFileChange}
                  />
                  <div
                    className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[16px] bg-white cursor-pointer flex items-center justify-between hover:border-gray-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="text-gray-900">{selectedFileName}</span>
                    <Paperclip className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                {fileError && (
                  <p className="text-red-500 text-sm mt-1">{fileError}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Supported: PNG, JPG, JPEG, PDF files (max 10MB). 
                  <br />
                  ⚠️ File names must not contain: &lt;%, &lt;script, or special characters.
                </p>
              </div>
            </div>

            {/* Column 2: Received Amount and Payment Type */}
            <div className="space-y-6">
              <div>
                <label className="block text-[14px] font-medium text-gray-900 mb-2">
                  Received Amount<span className="text-red-500">*</span>
                  {dealData && (
                    <span className="text-sm text-gray-500 ml-2 block">
                      (Remaining: {dealData.currency} {dealData.remaining_balance?.toFixed(2) || (dealData.deal_value - 0).toFixed(2)})
                    </span>
                  )}
                </label>
                <div className="flex">
                  {dealData && (
                    <div className="flex items-center bg-gray-50 border border-gray-300 border-r-0 rounded-l-lg text-sm font-medium text-gray-700 px-3">
                      {dealData.currency}
                    </div>
                  )}
                  <input
                    {...register("receivedAmount")}
                    type="text"
                    placeholder="0.00"
                    className={`h-[48px] px-4 border border-gray-300 ${dealData ? 'rounded-r-lg rounded-l-none' : 'rounded-lg'} text-[16px] focus:outline-none focus:border-gray-400 bg-white flex-1`}
                  />
                </div>
                {errors.receivedAmount && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.receivedAmount.message)}
                  </p>
                )}
                {dealData && (
                  <p className="text-xs text-gray-500 mt-1">
                    Deal Value: {dealData.currency} {dealData.deal_value.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="relative payment-type-dropdown">
                <label className="block text-[14px] font-medium text-gray-900 mb-2">
                  Payment Type<span className="text-red-500">*</span>
                </label>
                <div
                  className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[16px] bg-white cursor-pointer flex items-center justify-between hover:border-gray-400 transition-colors"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <span className="text-gray-900">{selectedPaymentType}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform ${
                      showDropdown ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 z-[9999] mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-y-auto max-h-[200px]">
                    {paymentTypes.map((type) => (
                      <div
                        key={type.value}
                        className={`px-4 py-3 cursor-pointer text-[16px] border-b border-gray-100 last:border-b-0 transition-colors ${
                          type.label === selectedPaymentType
                            ? "bg-gray-50 text-gray-900"
                            : type.label === "Partial Payment"
                            ? "text-[#4F46E5] hover:bg-blue-50"
                            : "text-gray-900 hover:bg-gray-50"
                        }`}
                        onClick={() => handlePaymentTypeSelect(type)}
                      >
                        {type.label}
                      </div>
                    ))}
                  </div>
                )}
                {errors.paymentType && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.paymentType.message)}
                  </p>
                )}
              </div>
            </div>

            {/* Column 3: Cheque No and Remarks */}
            <div className="space-y-6">
              <div>
                <label className="block text-[14px] font-medium text-gray-900 mb-2">
                  Cheque No.<span className="text-red-500">*</span>
                </label>
                <input
                  {...register("chequeNo")}
                  type="text"
                  placeholder="1234567"
                  className="w-full h-[48px] px-4 border border-gray-300 rounded-lg text-[16px] focus:outline-none focus:border-gray-400 bg-white"
                />
                {errors.chequeNo && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.chequeNo.message)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[14px] font-medium text-gray-900 mb-2">
                  Remarks<span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("remarks")}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[16px] focus:outline-none focus:border-gray-400 resize-none bg-white"
                  placeholder="Payment remarks..."
                />
                {errors.remarks && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.remarks.message)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer with blue-white gradient */}
        <div className="bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#8B5CF6] px-8 py-6 mt-auto">
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handleClear}
              disabled={isSubmitting}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white py-3 px-8 rounded-lg font-medium text-[16px] transition-colors min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#22C55E] hover:bg-[#16A34A] text-white py-3 px-8 rounded-lg font-medium text-[16px] transition-colors min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Payment"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddPayment;
