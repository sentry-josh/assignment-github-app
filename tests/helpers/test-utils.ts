import { GitHubUser } from "app/lib/types";

export class MockDataAccessHelper {
  static createMock(
    users: Record<string, GitHubUser>,
    followers: Record<string, string[]>,
  ) {
    return {
      findUser: vi
        .fn()
        .mockImplementation(
          (username: string) => users[username.toLowerCase()] || null,
        ),
      getFollowerUsernames: vi
        .fn()
        .mockImplementation(
          (username: string) => followers[username.toLowerCase()] || [],
        ),
    };
  }
}

export class TestUtils {
  static assertSortedBy<T>(
    array: T[],
    getter: (item: T) => number,
    order: "asc" | "desc" = "desc",
  ): void {
    for (let i = 1; i < array.length; i++) {
      const prev = getter(array[i - 1]);
      const curr = getter(array[i]);

      if (order === "desc" && prev < curr) {
        throw new Error(`Array not sorted in descending order at index ${i}`);
      }
      if (order === "asc" && prev > curr) {
        throw new Error(`Array not sorted in ascending order at index ${i}`);
      }
    }
  }
}
