import { GitHubUser } from "../types";
import { MOCK_FOLLOWERS } from "./followers";
import { MOCK_USERS } from "./users";

export class GitHubDataAccess {
  /**
   * Finds a user by username
   * @param username GitHub username (case-insensitive)
   * @returns User object or null if not found
   */
  findUser(username: string): GitHubUser | null {
    if (!username?.trim()) {
      return null;
    }

    return MOCK_USERS[username.toLowerCase()] || null;
  }

  /**
   * Gets list of follower usernames for a given user
   * @param username GitHub username (case-insensitive)
   * @returns Array of follower usernames
   */
  getFollowerUsernames(username: string): string[] {
    if (!username?.trim()) {
      return [];
    }

    return MOCK_FOLLOWERS[username.toLowerCase()] || [];
  }

  /**
   * Checks if a user exists in the system
   * @param username GitHub username to check
   * @returns True if user exists, false otherwise
   */
  userExists(username: string): boolean {
    return this.findUser(username) !== null;
  }

  /**
   * Gets the count of direct followers for a user
   * @param username GitHub username
   * @returns Number of direct followers
   */
  getFollowerCount(username: string): number {
    return this.getFollowerUsernames(username).length;
  }
}
