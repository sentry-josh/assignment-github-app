import { PaginationMeta } from "~/lib/util";

export interface GitHubAPIResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
  meta?: PaginationMeta;
}
