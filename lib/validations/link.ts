import { z } from "zod";

export const createLinkSchema = z.object({
    label: z.string().min(1, "Label is required").max(100),
    url: z.string().url("Must be a valid URL"),
    category: z.string().max(50).optional().default("general"),
    icon: z.string().max(10).optional(),
});

export const updateLinkSchema = z.object({
    label: z.string().min(1).max(100).optional(),
    url: z.string().url().optional(),
    category: z.string().max(50).optional(),
    icon: z.string().max(10).optional(),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
