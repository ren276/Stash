import { z } from "zod";

export const createSnippetSchema = z.object({
    title: z.string().min(1, "Title is required").max(200),
    body: z.string().min(1, "Body is required").max(10000),
    tags: z.array(z.string().max(50)).max(10).optional().default([]),
});

export const updateSnippetSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    body: z.string().min(1).max(10000).optional(),
    tags: z.array(z.string().max(50)).max(10).optional(),
});

export type CreateSnippetInput = z.infer<typeof createSnippetSchema>;
export type UpdateSnippetInput = z.infer<typeof updateSnippetSchema>;
