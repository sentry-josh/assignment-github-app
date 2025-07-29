export const GITHUB_LIMITS = {
  USERNAME_MIN_LENGTH: 1,
  USERNAME_MAX_LENGTH: 39,

  MIN_FOLLOWER_DEPTH: 1,
  MAX_FOLLOWER_DEPTH: 10,
  MAX_FOLLOWERS_PER_REQUEST: 100,
} as const;

export const GITHUB_PATTERNS = {
  USERNAME: /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/,
} as const;

export const GITHUB_BASE_URL = "https://github.com";
