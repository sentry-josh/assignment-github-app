export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name?: string;
  company?: string;
  blog?: string;
  location?: string;
  email?: string;
  hireable?: boolean;
  bio?: string;
  twitter_username?: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface UserRanking {
  user: GitHubUser;
  followersRank: number;
  depth: number;
  directFollowers: string[];
  allFollowers: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface DashboardLoaderData {
  rankings: PaginatedResponse<UserRanking>;
  username: string;
  depth: number;
  sort: SortOption;
  searchParams: URLSearchParams;
}

export type SortOption = "username" | "created_at" | "followers_rank";

export interface SearchFormData {
  username: string;
  depth: string;
}
