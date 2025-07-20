import { z } from "zod";
import { ANALYSIS_LIMITS } from "../../constants/analysis";
import { FollowerAnalysisSchema } from "./follower";

export const RankingConfigSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(39, "Username too long"),
  depth: z
    .number()
    .min(
      ANALYSIS_LIMITS.MIN_DEPTH,
      `Depth must be at least ${ANALYSIS_LIMITS.MIN_DEPTH}`,
    )
    .max(
      ANALYSIS_LIMITS.MAX_DEPTH,
      `Depth cannot exceed ${ANALYSIS_LIMITS.MAX_DEPTH}`,
    ),
  includeIndirectFollowers: z.boolean().default(true),
  maxFollowersToProcess: z
    .number()
    .positive()
    .max(ANALYSIS_LIMITS.MAX_FOLLOWERS_TO_PROCESS)
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
