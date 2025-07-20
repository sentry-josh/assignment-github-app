import z from "zod";

export const GitHubUserSchema = z.object({
  id: z.number().positive(),
  login: z.string().min(1).max(39),
  avatar_url: z.string(),
  html_url: z.string(),
  created_at: z.date().transform((date) => date.toISOString()),
  followers: z.number().nonnegative(),
  following: z.number().nonnegative(),
  public_repos: z.number().nonnegative(),
  bio: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
});

export type GitHubUser = z.infer<typeof GitHubUserSchema>;

export const GitHubUserProfileSchema = GitHubUserSchema.extend({
  blog: z.string().url().nullable().optional(),
  twitter_username: z.string().nullable().optional(),
  hireable: z.boolean().nullable().optional(),
  email: z.string().email().nullable().optional(),
  name: z.string().nullable().optional(),
});

export type GitHubUserProfile = z.infer<typeof GitHubUserProfileSchema>;
