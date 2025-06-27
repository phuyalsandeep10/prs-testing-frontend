import { z } from 'zod';

export const ClientSchema = z.object({
  clientName: z
    .string()
    .min(1, { message: 'Client name is required' }),

  email: z
    .string()
    .email({ message: 'Invalid email address' }),

  contactNumber: z
    .string()
    .min(5, { message: 'Contact number is required' }),

  nationality: z
    .string()
    .min(1, { message: 'Nationality is required' }),

  remarks: z
    .string()
    .optional(),
});
