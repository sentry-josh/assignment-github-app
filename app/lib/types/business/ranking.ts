import { z } from "zod";
import { FollowerAnalysisSchema } from "./follower";
import { GitHubUsernameSchema } from "../models";
import { GITHUB_LIMITS } from "~/lib/constants";

export const DepthSchema = z
  .number()
  .positive("Depth must be a positive number")
  .int("Depth must be a whole number")
  .min(
    GITHUB_LIMITS.MIN_FOLLOWER_DEPTH,
    `Minimum depth is ${GITHUB_LIMITS.MIN_FOLLOWER_DEPTH}`,
  )
  .max(
    GITHUB_LIMITS.MAX_FOLLOWER_DEPTH,
    `Maximum allowed depth is ${GITHUB_LIMITS.MAX_FOLLOWER_DEPTH}`,
  );

export const RankingConfigSchema = z.object({
  username: GitHubUsernameSchema,
  depth: DepthSchema,
  includeIndirectFollowers: z.boolean().default(true),
  maxFollowersToProcess: z
    .number()
    .positive()
    .max(GITHUB_LIMITS.MAX_FOLLOWERS_PER_REQUEST)
    .optional(),
});

export const RankingReportSchema = z.object({
  config: RankingConfigSchema,
  results: z.array(FollowerAnalysisSchema),
  totalProcessed: z.number().nonnegative(),
  processingTimeMs: z.number().nonnegative(),
  generatedAt: z.string().datetime(),
  metadata: z.object({
    uniqueUsers: z.number().nonnegative(),
    totalApiCalls: z.number().nonnegative(),
  }),
});

export type RankingConfig = z.infer<typeof RankingConfigSchema>;
export type RankingReport = z.infer<typeof RankingReportSchema>;
