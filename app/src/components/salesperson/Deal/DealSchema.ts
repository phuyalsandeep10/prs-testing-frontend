import { z } from 'zod';

export const DealSchema = z.object({
  dealId: z.string().optional(), // Optional since it's auto-generated on backend
  clientName: z.string().min(1, { message: 'Client Name is required' }),
  dealName: z.string().min(1, { message: 'Deal Name is required' }),
  payStatus: z.string().min(1, { message: 'Payment Status is required' }),
  sourceType: z.string().min(1, { message: 'Source Type is required' }),
  currency: z.string().min(1, { message: 'Currency is required' }),
  dealValue: z.string().min(1, { message: 'Deal Value is required' }),
  dealDate: z.string().min(1, { message: 'Deal Date is required' }),
  dueDate: z.string().min(1, { message: 'Due Date is required' }),
  payMethod: z.string().min(1, { message: 'Payment Method is required' }),
  dealRemarks: z.string().optional(),
  
  // First Payment Fields (optional at schema level, handled in form logic)
  paymentDate: z.string().optional(),
  receivedAmount: z.string().optional(),
  chequeNumber: z.string().optional(),
  uploadReceipt: z.any().optional(),
  paymentRemarks: z.string().optional(),
});
