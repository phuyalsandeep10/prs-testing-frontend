import { z } from "zod";

  export const DealSchema = z.object({
    dealId: z.string().optional(),
    clientName: z.string().min(1, { message: "Client Name is required" }),
    dealName: z.string().min(1, { message: "Deal Name is required" }),
    payStatus: z.string().min(1, { message: "Payment Status is required" }),
    sourceType: z.string().min(1, { message: "Source Type is required" }),
    dealValue: z.string().min(1, { message: "Deal Value is required" }),
    dealDate: z.string().min(1, { message: "Deal Date is required" }),
    dueDate: z.string().min(1, { message: "Due Date is required" }),
    payMethod: z.string().min(1, { message: "Payment Method is required" }),
    dealRemarks: z.string().optional(),
  
    // First Payment Fields - now mandatory
    paymentDate: z
      .string()
      .min(1, { message: "Payment Date is required" })
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Payment Date must be a valid date",
      }),
  
    receivedAmount: z
      .string()
      .min(1, { message: "Received Amount is required" })
      .refine((val) => /^[0-9]+(\.[0-9]{1,2})?$/.test(val), {
        message: "Received Amount must be a valid number",
      }),
  
    chequeNumber: z
      .string()
      .min(1, { message: "Cheque Number is required" })
      .refine((val) => /^[0-9]+$/.test(val), {
        message: "Cheque Number must contain digits only",
      }),
  
    uploadReceipt: z
      .any()
      .refine(
        (files) => files?.length > 0 && files[0]?.type === "application/pdf",
        { message: "Upload Receipt is required and must be a PDF file" }
      ),
  
    paymentRemarks: z.string().min(1, { message: "Payment Remarks is required" }),
  });
  