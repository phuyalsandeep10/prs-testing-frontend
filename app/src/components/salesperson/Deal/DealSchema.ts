import { z } from "zod";

// Helper function to safely parse decimal values
const parseDecimal = (value: string): number => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

// Base schema for deal fields (always required)
const BaseDealSchema = z.object({
  dealId: z.string().optional(), // Optional since it's auto-generated on backend
  clientName: z.string().min(1, { message: "Client Name is required" }),
  dealName: z.string().min(1, { message: "Deal Name is required" }),
  payStatus: z.string().min(1, { message: "Payment Status is required" }),
  sourceType: z.string().min(1, { message: "Source Type is required" }),
  currency: z.string().min(1, { message: "Currency is required" }),
  dealValue: z
    .string()
    .min(1, { message: "Deal Value is required" })
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Deal Value must be a positive number",
    }),
  dealDate: z.string().min(1, { message: "Deal Date is required" }),
  dueDate: z.string().min(1, { message: "Due Date is required" }),
  payMethod: z.string().min(1, { message: "Payment Method is required" }),
  dealRemarks: z.string().optional(),
});

// Payment schema for add mode (required)
const RequiredPaymentSchema = z.object({
  paymentDate: z.string().min(1, { message: "Payment Date is required" }),
  receivedAmount: z
    .string()
    .min(1, { message: "Received Amount is required" })
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Received Amount must be a positive number",
    }),
  chequeNumber: z.string().min(1, { message: "Cheque Number is required" }),
  uploadReceipt: z
    .any()
    .refine((files) => files?.length > 0, {
      message: "Upload Receipt is required",
    })
    .refine((files) => {
      if (files?.length > 0) {
        const fileName = files[0]?.name?.toLowerCase();
        return fileName?.endsWith(".pdf") || fileName?.endsWith(".png") || fileName?.endsWith(".jpg") || fileName?.endsWith(".jpeg");
      }
      return true;
    }, {
      message: "Only PDF, PNG, JPG, or JPEG files are allowed",
    }),
  paymentRemarks: z.string().min(1, { message: "Payment Remarks is required" }),
});

// Payment schema for edit mode (optional)
const OptionalPaymentSchema = z.object({
  paymentDate: z.string().optional(),
  receivedAmount: z.string().optional(),
  chequeNumber: z.string().optional(),
  uploadReceipt: z.any().optional(),
  paymentRemarks: z.string().optional(),
});

// Schema factory function
export const createDealSchema = (isEditMode: boolean = false, originalDealValue?: number) => {
  const paymentSchema = isEditMode ? OptionalPaymentSchema : RequiredPaymentSchema;
  let schema = BaseDealSchema.merge(paymentSchema);
  
  // Add cross-field validations only for add mode or when payment data is provided in edit mode
  if (!isEditMode) {
    schema = schema.refine((data) => {
      // Cross-field validation: Payment amount vs Deal value based on Payment Status
      const dealValue = parseDecimal(data.dealValue);
      const receivedAmount = parseDecimal(data.receivedAmount);
      
      if (data.payStatus === "Full Pay") {
        // For Full Pay, received amount must equal deal value (with small tolerance for floating point)
        return Math.abs(dealValue - receivedAmount) < 0.01;
      } else if (data.payStatus === "Partial Pay") {
        // For Partial Pay, received amount must be less than deal value and greater than 0
        return receivedAmount < dealValue && receivedAmount > 0;
      }
      
      return true;
    }, {
      message: "For Full Pay, received amount must equal deal value. For Partial Pay, received amount must be less than deal value.",
      path: ["receivedAmount"], // Error will show on receivedAmount field
    }).refine((data) => {
      // Validate payment date is not in the past (allow current and future dates)
      const paymentDate = new Date(data.paymentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      
      return paymentDate >= today;
    }, {
      message: "Payment date cannot be in the past",
      path: ["paymentDate"],
    }).refine((data) => {
      // Validate deal date is not after due date
      const dealDate = new Date(data.dealDate);
      const dueDate = new Date(data.dueDate);
      
      return dealDate <= dueDate;
    }, {
      message: "Deal date cannot be after due date",
      path: ["dueDate"],
    });
  } else {
    // For edit mode, validate deal date vs due date
    schema = schema.refine((data) => {
      // Validate deal date is not after due date
      const dealDate = new Date(data.dealDate);
      const dueDate = new Date(data.dueDate);
      
      return dealDate <= dueDate;
    }, {
      message: "Deal date cannot be after due date",
      path: ["dueDate"],
    });

    // Add deal value decrease validation for edit mode if original value is provided
    if (originalDealValue !== undefined) {
      schema = schema.refine((data) => {
        const newDealValue = parseDecimal(data.dealValue);
        return newDealValue >= originalDealValue;
      }, {
        message: `Deal value cannot be decreased below the original value of $${originalDealValue}`,
        path: ["dealValue"],
      });
    }
  }

  return schema;
};

// Default schema for backward compatibility (add mode)
export const DealSchema = createDealSchema(false);
