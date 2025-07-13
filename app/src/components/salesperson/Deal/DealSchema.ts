import { z } from "zod";

export const DealSchema = z.object({
  dealId: z.string().optional(), // Optional since it's auto-generated on backend
  clientName: z.string().min(1, { message: "Client Name is required" }),
  dealName: z.string().min(1, { message: "Deal Name is required" }),
  payStatus: z.string().min(1, { message: "Payment Status is required" }),
  sourceType: z.string().min(1, { message: "Source Type is required" }),
  currency: z.string().min(1, { message: "Currency is required" }),
  dealValue: z.string().min(1, { message: "Deal Value is required" }),
  dealDate: z.string().min(1, { message: "Deal Date is required" }),
  dueDate: z.string().min(1, { message: "Due Date is required" }),
  payMethod: z.string().min(1, { message: "Payment Method is required" }),
  dealRemarks: z.string().optional(),

  // First Payment Fields (required since they are marked as required in form)
  paymentDate: z.string().min(1, { message: "Payment Date is required" }),
  receivedAmount: z.string().min(1, { message: "Received Amount is required" }),
  chequeNumber: z.string().min(1, { message: "Cheque Number is required" }),
  uploadReceipt: z
    .any()
    .refine((files) => files?.length > 0, {
      message: "Upload Receipt is required",
    })
    .refine((files) => files?.[0]?.name?.toLowerCase().endsWith(".pdf"), {
      message: "Only PDF files are allowed",
    }),
  paymentRemarks: z.string().min(1, { message: "Payment Remarks is required" }),
});
