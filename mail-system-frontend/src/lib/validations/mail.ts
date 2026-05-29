import { z } from "zod";

export const sendMailSchema = z.object({
  to: z.string().min(1, "Recipient is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Message body is required"),
});

export type SendMailFormValues = z.infer<typeof sendMailSchema>;
