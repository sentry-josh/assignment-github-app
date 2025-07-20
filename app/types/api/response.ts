import { GitHubUser } from "../models/user";

export interface GitHubAPIResponse<T> {
  data: T;
  status: number;
  headers: {
    "x-ratelimit-limit": string;
    "x-ratelimit-remaining": string;
    "x-ratelimit-reset": string;
  };
}

export interface GitHubSearchResponse {
  items: GitHubUser[];
  total_count: number;
  incomplete_results?: boolean;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, string | number | boolean>;
  timestamp: string;
}
