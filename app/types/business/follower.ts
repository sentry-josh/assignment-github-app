import { z } from "zod";
import { GitHubUserSchema } from "../models/user";
import { ANALYSIS_LIMITS } from "../../constants/analysis";

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
    .min(ANALYSIS_LIMITS.MIN_DEPTH)
    .max(ANALYSIS_LIMITS.MAX_DEPTH),
  analysisDate: z.date().transform((date) => date.toISOString()),
  processingTimeMs: z.number().nonnegative().optional(),
});

export const AnalysisProgressSchema = z.object({
  current: z.number().nonnegative(),
  total: z.number().nonnegative(),
  currentUser: z.string(),
  stage: AnalysisStageSchema,
  percentage: z
    .number()
    .min(ANALYSIS_LIMITS.MIN_PERCENTAGE)
    .max(ANALYSIS_LIMITS.MAX_PERCENTAGE),
});

export type AnalysisStage = z.infer<typeof AnalysisStageSchema>;
export type FollowerAnalysis = z.infer<typeof FollowerAnalysisSchema>;
export type AnalysisProgress = z.infer<typeof AnalysisProgressSchema>;
