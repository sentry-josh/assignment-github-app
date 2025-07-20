export const NETWORK_SIMULATION = {
  // Delay simulation (for mock API)
  MIN_DELAY_MS: 100,
  MAX_DELAY_MS: 500,
  BASE_DELAY_MS: 200,

  // Error simulation rates
  ERROR_RATE: 0.02, // 2% error rate
  TIMEOUT_RATE: 0.01, // 1% timeout rate
  RATE_LIMIT_SIMULATION_RATE: 0.005, // 0.5% rate limit errors

  // Cache simulation
  CACHE_HIT_RATE: 0.7, // 70% cache hit rate
  CACHE_RESPONSE_DELAY_MS: 50, // Faster for cached responses
} as const;

// Real network configuration
export const NETWORK_CONFIG = {
  // Timeout settings
  REQUEST_TIMEOUT_MS: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,

  MAX_CONCURRENT_CONNECTIONS: 6, // Browser default
  KEEP_ALIVE_TIMEOUT_MS: 5000,

  EXPONENTIAL_BACKOFF_BASE: 2,
  MAX_BACKOFF_DELAY_MS: 30000, // 30 seconds max
} as const;
