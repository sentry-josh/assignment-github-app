import z from "zod";

export const GitHubUserSchema = z.object({
  id: z.number().positive(),
  login: z.string().min(1).max(39),
  avatar_url: z.string(),
  html_url: z.string(),
  created_at: z.date(),
  followers: z.number().nonnegative(),
  following: z.number().nonnegative(),
  public_repos: z.number().nonnegative(),
  bio: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
});

export const GitHubUsernameSchema = z
  .string()
  .min(1, "GitHub username is required")
  .min(2, "Username must be at least 2 characters")
  .max(39, "Username cannot exceed 39 characters")
  .regex(
    /^[a-zA-Z0-9]([a-zA-Z0-9-])*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/,
    "Username can only contain alphanumeric characters and hyphens, and cannot start or end with a hyphen",
  );

export type GitHubUser = z.infer<typeof GitHubUserSchema>;

export const UserDetails = GitHubUserSchema.extend({
  followersRank: z.number().nonnegative().default(0),
});

export type UserDetails = z.infer<typeof UserDetails>;
