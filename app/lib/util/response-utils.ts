import { HTTP_STATUS_CODES } from "../constants";
import { GitHubAPIResponse } from "../types";

export interface PaginationMeta {
  totalCount: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export class ResponseBuilder {
  static success<T>(data: T, meta?: PaginationMeta): GitHubAPIResponse<T> {
    return {
      data,
      status: HTTP_STATUS_CODES.OK,
      headers: {},
      ...(meta && { meta }),
    };
  }

  static withStatus<T>(
    data: T,
    status: number,
    meta?: PaginationMeta,
  ): GitHubAPIResponse<T> {
    return {
      data,
      status,
      headers: {},
      ...(meta && { meta }),
    };
  }
}
