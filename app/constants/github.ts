export const GITHUB_LIMITS = {
  USERNAME_MIN_LENGTH: 1,
  USERNAME_MAX_LENGTH: 39,
  BIO_MAX_LENGTH: 160,
  COMPANY_MAX_LENGTH: 100,
  LOCATION_MAX_LENGTH: 100,

  REPO_NAME_MAX_LENGTH: 100,
  REPO_DESCRIPTION_MAX_LENGTH: 350,

  UNAUTHENTICATED_RATE_LIMIT: 60, // requests per hour
  AUTHENTICATED_RATE_LIMIT: 5000, // requests per hour
  SEARCH_RATE_LIMIT: 30, // requests per minute

  MAX_FOLLOWERS_PER_PAGE: 100,
  MAX_FOLLOWING_PER_PAGE: 100,
  MAX_REPOS_PER_PAGE: 100,
} as const;

export const GITHUB_ENDPOINTS = {
  BASE_URL: "https://api.github.com",
  USERS: "/users",
  SEARCH_USERS: "/search/users",
  RATE_LIMIT: "/rate_limit",
} as const;

// GitHub validation patterns
export const GITHUB_PATTERNS = {
  USERNAME: /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/,
  REPO_NAME: /^[a-zA-Z0-9._-]+$/,
  URL: /^https:\/\/github\.com\/[a-zA-Z0-9\-._]+$/,
} as const;
