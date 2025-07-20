export const ANALYSIS_LIMITS = {
  MIN_DEPTH: 1,
  MAX_DEPTH: 5,
  DEFAULT_DEPTH: 2,

  MAX_FOLLOWERS_TO_PROCESS: 1000,
  MAX_CONCURRENT_REQUESTS: 10,
  REQUEST_TIMEOUT_MS: 30000,

  MIN_PERCENTAGE: 0,
  MAX_PERCENTAGE: 100,

  CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
  MAX_CACHE_SIZE: 10000, // number of entries
} as const;

export const ANALYSIS_STAGES = {
  INITIALIZING: "initializing",
  FETCHING: "fetching",
  ANALYZING: "analyzing",
  RANKING: "ranking",
  COMPLETE: "complete",
  ERROR: "error",
} as const;

export const RANKING_WEIGHTS = {
  DIRECT_FOLLOWERS: 1.0,
  INDIRECT_FOLLOWERS: 0.5,
  ACCOUNT_AGE_BONUS: 0.1,
  ACTIVITY_BONUS: 0.2,
} as const;
