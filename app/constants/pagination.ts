export const PAGINATION_LIMITS = {
  // Page constraints
  MIN_PAGE: 1,
  MAX_PAGE: 1000,

  // Per-page constraints
  MIN_PER_PAGE: 1,
  MAX_PER_PAGE: 100,
  DEFAULT_PER_PAGE: 30,

  DEFAULT_PAGE_SIZE_OPTIONS: [10, 30, 50, 100],
  MAX_VISIBLE_PAGE_BUTTONS: 7, // For pagination UI

  // Performance limits
  MAX_TOTAL_ITEMS: 10000, // Prevent memory issues
} as const;

export const PAGINATION_UI = {
  SHOW_PAGE_SIZE_SELECTOR: true,
  SHOW_TOTAL_COUNT: true,
  SHOW_PAGE_INFO: true,
  SHOW_QUICK_JUMP: false, // For large datasets
  COMPACT_MODE_THRESHOLD: 768, // px - switch to compact on mobile
} as const;
