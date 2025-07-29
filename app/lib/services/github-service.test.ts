import { beforeEach, describe, expect, it, MockedFunction, vi } from "vitest";
import { GitHubServiceTestHelper } from "../../../tests/helpers";
import { UserNotFoundError } from "../util";
import { GitHubService } from "./github-service";
import { GitHubUserBuilder, UserDetailsBuilder } from "../builders";
import { GitHubDataAccess } from "../mocks";

vi.mock("../../lib/utils/network-simulator", () => ({
  NetworkSimulator: {
    delay: vi.fn().mockResolvedValue(undefined),
  },
}));

type MockGitHubDataAccess = {
  findUser: ReturnType<typeof vi.fn>;
  getFollowerUsernames: ReturnType<typeof vi.fn>;
  userExists: ReturnType<typeof vi.fn>;
  getFollowerCount: ReturnType<typeof vi.fn>;
};

const createMockDataAccess = (): MockGitHubDataAccess => ({
  findUser: vi.fn(),
  getFollowerUsernames: vi.fn(),
  userExists: vi.fn(),
  getFollowerCount: vi.fn(),
});

describe("GitHubService", () => {
  let service: GitHubService;
  let mockDataAccess: {
    findUser: ReturnType<typeof vi.fn>;
    getFollowerUsernames: ReturnType<typeof vi.fn>;
    userExists: ReturnType<typeof vi.fn>;
    getFollowerCount: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockDataAccess = {
      findUser: vi.fn(),
      getFollowerUsernames: vi.fn(),
      userExists: vi.fn().mockReturnValue(true),
      getFollowerCount: vi.fn().mockReturnValue(0),
    };

    service = new GitHubService(mockDataAccess, {
      minDelay: 0,
      maxDelay: 0,
      maxDepth: 10,
    });
  });

  describe("getFollowersWithRank", () => {
    it("should calculate followers rank at depth 1", async () => {
      const users = {
        superman: GitHubUserBuilder.create()
          .withLogin("superman")
          .withId(1)
          .withFollowers(500)
          .build(),
        kratos: GitHubUserBuilder.create()
          .withLogin("kratos")
          .withId(2)
          .withFollowers(200)
          .build(),
        joshua: GitHubUserBuilder.create()
          .withLogin("joshua")
          .withId(3)
          .withFollowers(100)
          .build(),
      };

      const followers = {
        superman: ["kratos", "joshua"],
        kratos: [],
        joshua: [],
      };

      mockDataAccess.findUser.mockImplementation(
        (username: string) =>
          users[username.toLowerCase() as keyof typeof users] || null,
      );

      mockDataAccess.getFollowerUsernames.mockImplementation(
        (username: string) =>
          followers[username.toLowerCase() as keyof typeof followers] || [],
      );

      const result = await service.getFollowersWithRank("superman", 1);

      expect(result.data).toHaveLength(3);

      const superman = result.data.find((u) => u.login === "superman");
      const kratos = result.data.find((u) => u.login === "kratos");
      const joshua = result.data.find((u) => u.login === "joshua");

      expect(superman?.followersRank).toBe(2);
      expect(kratos?.followersRank).toBe(0);
      expect(joshua?.followersRank).toBe(0);
    });

    it("should calculate followers rank at depth 2", async () => {
      const users = {
        superman: GitHubUserBuilder.create()
          .withLogin("superman")
          .withFollowers(1000)
          .build(),
        kratos: GitHubUserBuilder.create()
          .withLogin("kratos")
          .withFollowers(500)
          .build(),
        joshua: GitHubUserBuilder.create()
          .withLogin("joshua")
          .withFollowers(300)
          .build(),
        vegeta: GitHubUserBuilder.create()
          .withLogin("vegeta")
          .withFollowers(100)
          .build(),
      };

      const followers = {
        superman: ["kratos", "joshua"],
        kratos: ["vegeta"],
        joshua: [],
        vegeta: [],
      };

      mockDataAccess.findUser.mockImplementation(
        (username: string) =>
          users[username.toLowerCase() as keyof typeof users] || null,
      );

      mockDataAccess.getFollowerUsernames.mockImplementation(
        (username: string) =>
          followers[username.toLowerCase() as keyof typeof followers] || [],
      );

      const result = await service.getFollowersWithRank("superman", 2);

      expect(result.data).toHaveLength(4);

      const superman = result.data.find((u) => u.login === "superman");
      const kratos = result.data.find((u) => u.login === "kratos");

      expect(superman?.followersRank).toBe(3);
      expect(kratos?.followersRank).toBe(1);
    });

    it("should sort users by followers rank (highest first)", async () => {
      const users = {
        superman: GitHubUserBuilder.create()
          .withLogin("superman")
          .withFollowers(5000)
          .build(),
        kratos: GitHubUserBuilder.create()
          .withLogin("kratos")
          .withFollowers(1000)
          .build(),
        joshua: GitHubUserBuilder.create()
          .withLogin("joshua")
          .withFollowers(100)
          .build(),
      };

      const followers = {
        superman: ["kratos", "joshua"],
        kratos: ["joshua"],
        joshua: [],
      };

      mockDataAccess.findUser.mockImplementation(
        (username: string) =>
          users[username.toLowerCase() as keyof typeof users] || null,
      );

      mockDataAccess.getFollowerUsernames.mockImplementation(
        (username: string) =>
          followers[username.toLowerCase() as keyof typeof followers] || [],
      );

      const result = await service.getFollowersWithRank("superman", 2);

      expect(result.data[0].login).toBe("superman");
      expect(result.data[0].followersRank).toBeGreaterThan(
        result.data[1].followersRank,
      );
    });

    it("should handle pagination correctly", async () => {
      const users = {
        superman: GitHubUserBuilder.create().withLogin("superman").build(),
        user1: GitHubUserBuilder.create().withLogin("user1").build(),
        user2: GitHubUserBuilder.create().withLogin("user2").build(),
        user3: GitHubUserBuilder.create().withLogin("user3").build(),
      };

      const followers = {
        superman: ["user1", "user2", "user3"],
        user1: [],
        user2: [],
        user3: [],
      };

      mockDataAccess.findUser.mockImplementation(
        (username: string) =>
          users[username.toLowerCase() as keyof typeof users] || null,
      );

      mockDataAccess.getFollowerUsernames.mockImplementation(
        (username: string) =>
          followers[username.toLowerCase() as keyof typeof followers] || [],
      );

      const firstPage = await service.getFollowersWithRank(
        "superman",
        1,
        undefined,
        1,
        2,
      );
      expect(firstPage.data).toHaveLength(2);
      expect(firstPage.meta?.page).toBe(1);
      expect(firstPage.meta?.hasMore).toBe(true);

      // Test second page
      const secondPage = await service.getFollowersWithRank(
        "superman",
        1,
        undefined,
        2,
        2,
      );
      expect(secondPage.data).toHaveLength(2);
      expect(secondPage.meta?.page).toBe(2);
      expect(secondPage.meta?.hasMore).toBe(false);
    });

    it("should handle sorting options", async () => {
      const users = {
        superman: GitHubUserBuilder.create()
          .withLogin("superman")
          .withCreatedAt(new Date("2020-01-01"))
          .build(),
        batman: GitHubUserBuilder.create()
          .withLogin("batman")
          .withCreatedAt(new Date("2019-01-01"))
          .build(),
      };

      const followers = {
        superman: ["batman"],
        batman: [],
      };

      mockDataAccess.findUser.mockImplementation(
        (username: string) =>
          users[username.toLowerCase() as keyof typeof users] || null,
      );

      mockDataAccess.getFollowerUsernames.mockImplementation(
        (username: string) =>
          followers[username.toLowerCase() as keyof typeof followers] || [],
      );

      const usernameSort = await service.getFollowersWithRank("superman", 1, {
        field: "username",
        direction: "asc",
      });
      expect(usernameSort.data[0].login).toBe("batman");
      expect(usernameSort.data[1].login).toBe("superman");

      const dateSort = await service.getFollowersWithRank("superman", 1, {
        field: "createdAt",
        direction: "asc",
      });
      expect(dateSort.data[0].login).toBe("batman");
    });

    it("should handle circular references without infinite loop", async () => {
      const users = {
        superman: GitHubUserBuilder.create().withLogin("superman").build(),
        kratos: GitHubUserBuilder.create().withLogin("kratos").build(),
      };

      const followers = {
        superman: ["kratos"],
        kratos: ["superman"],
      };

      mockDataAccess.findUser.mockImplementation(
        (username: string) =>
          users[username.toLowerCase() as keyof typeof users] || null,
      );

      mockDataAccess.getFollowerUsernames.mockImplementation(
        (username: string) =>
          followers[username.toLowerCase() as keyof typeof followers] || [],
      );

      const result = await service.getFollowersWithRank("superman", 3);

      expect(result.data).toHaveLength(2);
      expect(result.data.some((u) => u.login === "superman")).toBe(true);
      expect(result.data.some((u) => u.login === "kratos")).toBe(true);
    });

    it("should throw UserNotFoundError when root user does not exist", async () => {
      mockDataAccess.findUser.mockReturnValue(null);

      await expect(
        service.getFollowersWithRank("nonexistent", 1),
      ).rejects.toThrow(UserNotFoundError);
    });

    it("should throw validation error for invalid username", async () => {
      await expect(service.getFollowersWithRank("", 1)).rejects.toThrow(
        "Validation error",
      );

      await expect(service.getFollowersWithRank("   ", 1)).rejects.toThrow(
        "Validation error",
      );
    });

    it("should throw validation error for invalid depth", async () => {
      await expect(
        service.getFollowersWithRank("superman", -1),
      ).rejects.toThrow("Validation error");

      await expect(
        service.getFollowersWithRank("superman", 1.5),
      ).rejects.toThrow("Validation error");

      await expect(
        service.getFollowersWithRank("superman", 11), // exceeds max depth
      ).rejects.toThrow("Validation error");
    });

    it("should throw validation error for invalid pagination", async () => {
      const user = GitHubUserBuilder.create().withLogin("user").build();
      mockDataAccess.findUser.mockReturnValue(user);

      await expect(
        service.getFollowersWithRank("user", 1, undefined, 0, 10),
      ).rejects.toThrow("Validation error");

      await expect(
        service.getFollowersWithRank("user", 1, undefined, 1, 0),
      ).rejects.toThrow("Validation error");
    });

    it("should throw validation error for invalid depth", async () => {
      await expect(service.getFollowersWithRank("superman", 0)).rejects.toThrow(
        "Validation error: Depth must be a positive number",
      );

      await expect(
        service.getFollowersWithRank("superman", -1),
      ).rejects.toThrow("Validation error");

      await expect(
        service.getFollowersWithRank("superman", 1.5),
      ).rejects.toThrow("Validation error");

      await expect(
        service.getFollowersWithRank("superman", 11),
      ).rejects.toThrow("Validation error");
    });
  });

  describe("Configuration", () => {
    it("should use default configuration when no options provided", () => {
      const defaultService = new GitHubService();
      expect(defaultService).toBeInstanceOf(GitHubService);
    });

    it("should use default configuration when undefined dataAccess provided", () => {
      const serviceWithUndefined = new GitHubService(undefined, {
        maxDepth: 5,
      });
      expect(serviceWithUndefined).toBeInstanceOf(GitHubService);
    });

    it("should use custom configuration via test helper", () => {
      const testService = GitHubServiceTestHelper.createTestService();
      expect(testService).toBeInstanceOf(GitHubService);
    });

    it("should use injected data access with options", () => {
      const customDataAccess: GitHubDataAccess = {
        findUser: vi.fn(),
        getFollowerUsernames: vi.fn(),
        userExists: vi.fn(),
        getFollowerCount: vi.fn(),
      };

      const serviceWithCustomData = new GitHubService(customDataAccess, {
        maxDepth: 5,
        minDelay: 100,
      });

      expect(serviceWithCustomData).toBeInstanceOf(GitHubService);
    });
  });

  describe("UserDetailsBuilder integration", () => {
    it("should work with UserDetailsBuilder for creating expected results", () => {
      const baseUser = GitHubUserBuilder.create()
        .withLogin("ranked-user")
        .withFollowers(500)
        .build();

      const userDetails = UserDetailsBuilder.fromUser(baseUser)
        .withFollowersRank(1250)
        .build();

      expect(userDetails.login).toBe("ranked-user");
      expect(userDetails.followers).toBe(500);
      expect(userDetails.followersRank).toBe(1250);
    });

    it("should create UserDetails from builder chain", () => {
      const userDetails = UserDetailsBuilder.fromBuilder(
        GitHubUserBuilder.create()
          .withLogin("influencer")
          .withId(999)
          .withFollowers(50000),
      )
        .withFollowersRank(75000)
        .build();

      expect(userDetails.id).toBe(999);
      expect(userDetails.login).toBe("influencer");
      expect(userDetails.followers).toBe(50000);
      expect(userDetails.followersRank).toBe(75000);
    });
  });
});
