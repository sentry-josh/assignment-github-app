import { z } from "zod";
import { GITHUB_LIMITS, NETWORK_SIMULATION } from "../constants";
import { GitHubDataAccess } from "../mocks";
import {
  GitHubAPIResponse,
  GitHubUser,
  SortOptions,
  UserDetails,
  GitHubUsernameSchema,
  GitHubUserSchema,
  DepthSchema,
  PaginationParamsSchema,
} from "../types";
import { ResponseBuilder, NetworkSimulator, UserNotFoundError } from "../util";

export interface GitHubServiceOptions {
  readonly minDelay?: number;
  readonly maxDelay?: number;
  readonly maxDepth?: number;
}

export interface GitHubRepository {
  getFollowersWithRank(
    username: string,
    depth: number,
    sortOptions?: SortOptions,
    page?: number,
    perPage?: number,
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

  async getFollowersWithRank(
    username: string,
    depth: number,
    sortOptions?: SortOptions,
    page = 1,
    perPage = 12,
  ): Promise<GitHubAPIResponse<UserDetails[]>> {
    this.validateInputs(username, depth, page, perPage);

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

  private validateInputs(
    username: string,
    depth: number,
    page: number,
    perPage: number,
  ): void {
    try {
      GitHubUsernameSchema.parse(username);
      DepthSchema.parse(depth);
      PaginationParamsSchema.parse({ page, perPage });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstIssue = error.issues[0];
        throw new Error(`Validation error: ${firstIssue.message}`);
      }
      throw error;
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

      // Validate user data with Zod (showcases runtime type safety)
      try {
        const validatedUser = GitHubUserSchema.parse(user);
        allUsers.set(currentUsername.toLowerCase(), validatedUser);
      } catch (error) {
        console.warn(`Invalid user data for ${currentUsername}:`, error);
        return;
      }

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

      // Validate the final UserDetails object
      const userDetails = UserDetails.parse({
        ...user,
        followersRank,
      });

      usersWithRanks.push(userDetails);
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
