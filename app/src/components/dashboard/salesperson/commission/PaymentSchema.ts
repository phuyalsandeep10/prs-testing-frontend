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
    (files) => {
      if (files?.length > 0) {
        const fileName = files[0]?.name?.toLowerCase();
        return fileName?.endsWith(".pdf") || fileName?.endsWith(".png") || fileName?.endsWith(".jpg") || fileName?.endsWith(".jpeg");
      }
      return true;
    },
    {
      message: "Only PDF, PNG, JPG, or JPEG files are allowed",
    }
  ),

  paymentRemarks: z.string().min(1, { message: 'Payment Remarks is required' }),
});
