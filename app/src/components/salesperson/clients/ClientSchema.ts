import { z } from 'zod';

export const ClientSchema = z.object({
  clientName: z
    .string()
    .min(1, { message: 'Client name is required' })
    .regex(/^[A-Za-z\s]+$/, { message: 'Client name can only contain letters and spaces' }),

  email: z
    .string()
    .email({ message: 'Invalid email address' }),

  contactNumber: z
    .string()
    .min(5, { message: 'Contact number is required' }),

  nationality: z
    .string()
    .min(1, { message: 'Nationality is required' }),

  status: z.enum(['Pending', 'Bad Depth', 'Clear'], {
    errorMap: () => ({ message: 'Please select a valid status' }),
  }),

  satisfaction: z.enum(['Neutral', 'Negative', 'Positive'], {
    errorMap: () => ({ message: 'Please select a valid satisfaction' }),
  }),

  remarks: z.string().optional(),
});
