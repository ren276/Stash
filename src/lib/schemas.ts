import { z } from 'zod';

export const LinkSchema = z.object({
  label: z.string(),
  url: z.string().url(),
  category: z.string(),
  createdAt: z.string()
});

export const SnippetSchema = z.object({
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string()),
  createdAt: z.string()
});

export const JobSchema = z.object({
  title: z.string(),
  company: z.string(),
  url: z.string().url(),
  status: z.enum(['Interested', 'Applied', 'Interviewing', 'Offer', 'Rejected']),
  timestamp: z.string()
});

export const BackupSchema = z.object({
  version: z.literal(1),
  links: z.array(LinkSchema),
  snippets: z.array(SnippetSchema),
  jobs: z.array(JobSchema),
  exportedAt: z.string()
});

export type Backup = z.infer<typeof BackupSchema>;
