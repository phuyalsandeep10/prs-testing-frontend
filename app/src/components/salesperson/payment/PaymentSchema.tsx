import { z } from 'zod';

export const DealSchema = z.object({
  dealId: z.string().min(1, { message: 'Deal ID is required' }),
  clientName: z.string().min(1, { message: 'Client Name is required' }),
  dealName: z.string().min(1, { message: 'Deal Name is required' }),
  payStatus: z.string().min(1, { message: 'Payment Status is required' }),
  payMethod: z.string().min(1, { message: 'Payment Method is required' }),
  sourceType: z.string().min(1, { message: 'Source Type is required' }),
  dealDate: z.string().min(1, { message: 'Deal Date is required' }),
  dueDate: z.string().min(1, { message: 'Due Date is required' }),
  dealValue: z.string().min(1, { message: 'Deal Value is required' }),
  dealRemarks: z.string().optional(),
  paymentDate: z.string().min(1, { message: 'Payment Date is required' }),
  receivedAmount: z.string().min(1, { message: 'Received Amount is required' }),
  chequeNumber: z.string().min(1, { message: 'Cheque Number is required' }),
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
