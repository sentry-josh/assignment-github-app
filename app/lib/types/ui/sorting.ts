export type SortField = "username" | "createdAt" | "followersRank";
export type SortDirection = "asc" | "desc";

export interface SortOptions {
  field: SortField;
  direction: SortDirection;
}

export const SORT_OPTIONS = [
  { field: "username" as const, label: "Username" },
  { field: "createdAt" as const, label: "Profile Creation Date" },
  { field: "followersRank" as const, label: "Followers Rank" },
];

