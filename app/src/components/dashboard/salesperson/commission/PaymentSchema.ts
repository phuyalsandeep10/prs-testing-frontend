import { z } from 'zod';

export const PaymentSchema = z.object({
  "Payment Date": z.string().min(1, { message: 'Deal ID is required' }),
  "Received Amount": z.string().min(1, { message: 'Client Name is required' }),
  "Cheque No.": z.string().min(1, { message: 'Deal Name is required' }),
  "Attach Reciept": z.string().min(1, { message: 'Payment Status is required' }),
  "Payment Type*": z.string().min(1, { message: 'Payment Method is required' }),
  "Remarks": z.string().min(1, { message: 'Source Type is required' }),
  uploadReceipt: z
  .any()
  .refine((files) => files?.length === 1, {
    message: "Upload Receipt is required",
  })
  .refine(
    (files) => files?.[0]?.name.toLowerCase().endsWith(".pdf"),
    {
      message: "Only PDF files are allowed",
    }
  ),

  paymentRemarks: z.string().min(1, { message: 'Payment Remarks is required' }),
});
