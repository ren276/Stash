import { z } from "zod";

export const uploadResumeSchema = z.object({
    label: z.string().min(1, "Label is required").max(100),
    role_type: z.string().max(100).optional(),
});

export type UploadResumeInput = z.infer<typeof uploadResumeSchema>;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPE = "application/pdf";
