import { GITHUB_LIMITS, NETWORK_SIMULATION } from "../constants";
import { GitHubDataAccess } from "../mocks";
import {
  GitHubAPIResponse,
  GitHubUser,
  SortOptions,
  UserDetails,
} from "../types";
import {
  ResponseBuilder,
  NetworkSimulator,
  UserNotFoundError,
  InvalidUsernameError,
  InvalidDepthError,
  InvalidPaginationError,
} from "../util";

export interface GitHubServiceOptions {
  readonly minDelay?: number;
  readonly maxDelay?: number;
  readonly maxDepth?: number;
}

export interface GitHubRepository {
  getUser(username: string): Promise<GitHubAPIResponse<GitHubUser>>;
  getFollowers(
    username: string,
    page?: number,
    perPage?: number,
  ): Promise<GitHubAPIResponse<GitHubUser[]>>;
  getFollowersWithRank(
    username: string,
    depth: number,
  ): Promise<GitHubAPIResponse<UserDetails[]>>;
}

export class GitHubService implements GitHubRepository {
  private readonly config: Required<GitHubServiceOptions>;
  private readonly dataAccess: GitHubDataAccess;

  constructor(dataAccess?: GitHubDataAccess, options?: GitHubServiceOptions) {
    this.config = {
      minDelay: options?.minDelay ?? NETWORK_SIMULATION.MIN_DELAY_MS,
      maxDelay: options?.maxDelay ?? NETWORK_SIMULATION.MAX_DELAY_MS,
      maxDepth: options?.maxDepth ?? GITHUB_LIMITS.MAX_FOLLOWER_DEPTH,
    };
    this.dataAccess = dataAccess ?? new GitHubDataAccess();
  }

  private validateUsername(username: string): void {
    if (!username?.trim()) {
      throw new InvalidUsernameError(username);
    }
  }

  private validateDepth(depth: number): void {
    if (!Number.isInteger(depth) || depth < 0) {
      throw new InvalidDepthError(depth, this.config.maxDepth);
    }

    if (depth > this.config.maxDepth) {
      throw new InvalidDepthError(depth, this.config.maxDepth);
    }
  }

  private validatePagination(page: number, perPage: number): void {
    if (
      page < 1 ||
      perPage < 1 ||
      perPage > GITHUB_LIMITS.MAX_FOLLOWERS_PER_REQUEST
    ) {
      throw new InvalidPaginationError(page, perPage);
    }
  }

  private calculateFollowersRank(
    username: string,
    depth: number,
    visited = new Set<string>(),
  ): number {
    if (depth === 0 || visited.has(username.toLowerCase())) {
      return 0;
    }

    visited.add(username.toLowerCase());
    const followerUsernames = this.dataAccess.getFollowerUsernames(username);
    let rank = followerUsernames.length;

    for (const followerUsername of followerUsernames) {
      rank += this.calculateFollowersRank(followerUsername, depth - 1, visited);
    }

    return rank;
  }

  async getUser(username: string): Promise<GitHubAPIResponse<GitHubUser>> {
    this.validateUsername(username);
    await NetworkSimulator.delay(this.config.minDelay, this.config.maxDelay);

    const user = this.dataAccess.findUser(username);
    if (!user) {
      throw new UserNotFoundError(username);
    }

    return ResponseBuilder.success(user);
  }

  async getFollowers(
    username: string,
    page = 1,
    perPage = 30,
  ): Promise<GitHubAPIResponse<GitHubUser[]>> {
    this.validateUsername(username);
    this.validatePagination(page, perPage);
    await NetworkSimulator.delay(this.config.minDelay, this.config.maxDelay);

    const followerUsernames = this.dataAccess.getFollowerUsernames(username);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedUsernames = followerUsernames.slice(startIndex, endIndex);

    const followers = paginatedUsernames
      .map((name) => this.dataAccess.findUser(name))
      .filter((user): user is GitHubUser => user !== null);

    return ResponseBuilder.success(followers);
  }

  async getFollowersWithRank(
    username: string,
    depth: number,
    sortOptions?: SortOptions,
    page = 1,
    perPage = 12,
  ): Promise<GitHubAPIResponse<UserDetails[]>> {
    this.validateUsername(username);
    this.validateDepth(depth);
    this.validatePagination(page, perPage);
    await NetworkSimulator.delay(this.config.minDelay, this.config.maxDelay);

    const rootUser = this.dataAccess.findUser(username);
    if (!rootUser) {
      throw new UserNotFoundError(username);
    }

    const allUsers = this.collectAllUsers(username, depth);
    const sortedUsers = this.calculateRanksForUsers(
      allUsers,
      depth,
      sortOptions,
    );

    return this.paginateResults(sortedUsers, page, perPage);
  }

  private collectAllUsers(
    username: string,
    maxDepth: number,
  ): Map<string, GitHubUser> {
    const allUsers = new Map<string, GitHubUser>();
    const visited = new Set<string>();

    const collect = (currentUsername: string, currentDepth: number): void => {
      if (currentDepth < 0 || visited.has(currentUsername.toLowerCase())) {
        return;
      }

      visited.add(currentUsername.toLowerCase());
      const user = this.dataAccess.findUser(currentUsername);
      if (!user) return;

      allUsers.set(currentUsername.toLowerCase(), user);

      if (currentDepth > 0) {
        const followerUsernames =
          this.dataAccess.getFollowerUsernames(currentUsername);
        followerUsernames.forEach((name) => collect(name, currentDepth - 1));
      }
    };

    collect(username, maxDepth);
    return allUsers;
  }

  private calculateRanksForUsers(
    users: Map<string, GitHubUser>,
    depth: number,
    sortOptions?: SortOptions,
  ): UserDetails[] {
    const usersWithRanks: UserDetails[] = [];

    for (const [username, user] of users) {
      const followersRank = this.calculateFollowersRank(username, depth);
      usersWithRanks.push({ ...user, followersRank });
    }

    return this.sortUsers(usersWithRanks, sortOptions);
  }

  private sortUsers(
    users: UserDetails[],
    sortOptions?: SortOptions,
  ): UserDetails[] {
    const { field = "followersRank", direction = "desc" } = sortOptions || {};

    return users.sort((a, b) => {
      let comparison = 0;

      switch (field) {
        case "username":
          comparison = a.login.localeCompare(b.login);
          break;
        case "createdAt":
          comparison = a.created_at.getTime() - b.created_at.getTime();
          break;
        case "followersRank":
          comparison = a.followersRank - b.followersRank;
          break;
      }

      return direction === "asc" ? comparison : -comparison;
    });
  }

  private paginateResults<T>(
    items: T[],
    page: number,
    perPage: number,
  ): GitHubAPIResponse<T[]> {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedItems = items.slice(startIndex, endIndex);

    return ResponseBuilder.success(paginatedItems, {
      totalCount: items.length,
      page,
      perPage,
      hasMore: endIndex < items.length,
    });
  }
}
