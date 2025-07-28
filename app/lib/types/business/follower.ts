import { z } from "zod";
import { GitHubUserSchema, UserDetails } from "../models/user";
import { GITHUB_LIMITS } from "../../constants";

export const AnalysisStageSchema = z.enum([
  "fetching",
  "analyzing",
  "ranking",
  "complete",
]);

export const FollowerAnalysisSchema = z.object({
  user: GitHubUserSchema,
  directFollowers: z.array(GitHubUserSchema),
  allFollowers: z.array(GitHubUserSchema),
  followersRank: z.number().nonnegative(),
  depth: z
    .number()
    .min(GITHUB_LIMITS.MIN_FOLLOWER_DEPTH)
    .max(GITHUB_LIMITS.MAX_FOLLOWER_DEPTH),
  analysisDate: z.date().transform((date) => date.toISOString()),
  processingTimeMs: z.number().nonnegative().optional(),
});

export const AnalysisProgressSchema = z.object({
  current: z.number().nonnegative(),
  total: z.number().nonnegative(),
  currentUser: z.string(),
  stage: AnalysisStageSchema,
  percentage: z.number(),
});

export interface AnalysisResults {
  totalUsers: number;
  rootUser: string;
  depth: number;
}

export type AnalysisStage = z.infer<typeof AnalysisStageSchema>;
export type FollowerAnalysis = z.infer<typeof FollowerAnalysisSchema>;
export type AnalysisProgress = z.infer<typeof AnalysisProgressSchema>;
