// services/GitHubService.ts
import { GitHubUser } from "../types/github";
import { MockGitHubService } from "../mocks/api/MockGitHubService";

export interface FollowerAnalysis {
  user: GitHubUser;
  directFollowers: GitHubUser[];
  allFollowers: GitHubUser[];
  followersRank: number;
  depth: number;
}

export interface GitHubAPIInterface {
  getUser(username: string): Promise<GitHubUser | null>;
  getFollowers(
    username: string,
    page?: number,
    perPage?: number,
  ): Promise<GitHubUser[]>;
  getFollowersCount(username: string): Promise<number>;
  checkRateLimit?(): Promise<{ remaining: number; resetTime: number }>;
}

// Real GitHub API implementation
export class RealGitHubService implements GitHubAPIInterface {
  private readonly baseURL = "https://api.github.com";
  private readonly token?: string;

  constructor(token?: string) {
    this.token = token;
  }

  private async fetchWithAuth(url: string) {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "GitHub-Ranking-Report",
    };

    if (this.token) {
      headers["Authorization"] = `token ${this.token}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }

  async getUser(username: string): Promise<GitHubUser | null> {
    try {
      return await this.fetchWithAuth(`${this.baseURL}/users/${username}`);
    } catch (error) {
      return null;
    }
  }

  async getFollowers(
    username: string,
    page = 1,
    perPage = 30,
  ): Promise<GitHubUser[]> {
    const url = `${this.baseURL}/users/${username}/followers?page=${page}&per_page=${perPage}`;
    return await this.fetchWithAuth(url);
  }

  async getFollowersCount(username: string): Promise<number> {
    const user = await this.getUser(username);
    return user?.followers || 0;
  }

  async checkRateLimit() {
    const response = await this.fetchWithAuth(`${this.baseURL}/rate_limit`);
    return {
      remaining: response.rate.remaining,
      resetTime: response.rate.reset * 1000,
    };
  }
}

export class GitHubService {
  private api: MockGitHubService;
  private cache = new Map<string, any>();
  private visitedUsers = new Set<string>();

  constructor() {
    this.api = new MockGitHubService();
  }

  // Cache management
  private getCacheKey(username: string, action: string, params?: any): string {
    return `${username}-${action}-${JSON.stringify(params || {})}`;
  }

  private getFromCache<T>(key: string): T | null {
    return this.cache.get(key) || null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, data);
  }

  // Core methods with caching
  async getUser(username: string): Promise<GitHubUser | null> {
    const cacheKey = this.getCacheKey(username, "user");
    const cached = this.getFromCache<GitHubUser>(cacheKey);

    if (cached) return cached;

    const user = await this.api.getUser(username);
    if (user) {
      this.setCache(cacheKey, user);
    }

    return user;
  }

  async getFollowers(
    username: string,
    page = 1,
    perPage = 30,
  ): Promise<GitHubUser[]> {
    const cacheKey = this.getCacheKey(username, "followers", { page, perPage });
    const cached = this.getFromCache<GitHubUser[]>(cacheKey);

    if (cached) return cached;

    const followers = await this.api.getFollowers(username, page, perPage);
    this.setCache(cacheKey, followers);

    return followers;
  }

  // Main ranking algorithm
  async analyzeFollowersWithDepth(
    username: string,
    maxDepth: number,
    onProgress?: (current: number, total: number, currentUser: string) => void,
  ): Promise<FollowerAnalysis | null> {
    const user = await this.getUser(username);
    if (!user) return null;

    this.visitedUsers.clear();
    const allFollowers = new Set<string>();
    let processedCount = 0;
    let totalEstimate = 1;

    const traverseFollowers = async (
      currentUsername: string,
      currentDepth: number,
    ): Promise<void> => {
      if (currentDepth === 0 || this.visitedUsers.has(currentUsername)) {
        return;
      }

      this.visitedUsers.add(currentUsername);
      processedCount++;

      if (onProgress) {
        onProgress(processedCount, totalEstimate, currentUsername);
      }

      try {
        const followers = await this.getFollowers(currentUsername);

        // Update total estimate
        if (currentDepth > 1) {
          totalEstimate += followers.length;
        }

        for (const follower of followers) {
          allFollowers.add(follower.login);

          // Recursively get followers of followers
          if (currentDepth > 1) {
            await traverseFollowers(follower.login, currentDepth - 1);
          }
        }
      } catch (error) {
        console.warn(`Failed to get followers for ${currentUsername}:`, error);
      }
    };

    await traverseFollowers(username, maxDepth);

    // Get direct followers
    const directFollowers = await this.getFollowers(username);

    // Convert all follower usernames to user objects
    const allFollowerUsers: GitHubUser[] = [];
    for (const followerUsername of allFollowers) {
      try {
        const followerUser = await this.getUser(followerUsername);
        if (followerUser) {
          allFollowerUsers.push(followerUser);
        }
      } catch (error) {
        console.warn(`Failed to get user data for ${followerUsername}`);
      }
    }

    return {
      user,
      directFollowers,
      allFollowers: allFollowerUsers,
      followersRank: allFollowers.size,
      depth: maxDepth,
    };
  }

  // Batch analysis for multiple users
  async batchAnalyzeUsers(
    usernames: string[],
    depth: number,
    onProgress?: (
      completed: number,
      total: number,
      currentUser: string,
    ) => void,
  ): Promise<FollowerAnalysis[]> {
    const results: FollowerAnalysis[] = [];

    for (let i = 0; i < usernames.length; i++) {
      const username = usernames[i];

      if (onProgress) {
        onProgress(i, usernames.length, username);
      }

      const analysis = await this.analyzeFollowersWithDepth(username, depth);
      if (analysis) {
        results.push(analysis);
      }
    }

    return results;
  }

  // Utility methods
  clearCache(): void {
    this.cache.clear();
  }

  async getRateLimit() {
    if (this.api.checkRateLimit) {
      return await this.api.checkRateLimit();
    }
    return { remaining: 999, resetTime: Date.now() + 3600000 };
  }

  // Generate sample data for testing
  static getSampleUsernames(): string[] {
    return ["torvalds", "gaearon", "addyosmani", "sindresorhus", "kentcdodds"];
  }
}
