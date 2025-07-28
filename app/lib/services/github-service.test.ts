import { beforeEach, describe, expect, it, vi } from "vitest";
import { GitHubServiceTestHelper } from "../../../tests/helpers";
import {
  UserNotFoundError,
  InvalidUsernameError,
  InvalidDepthError,
  InvalidPaginationError,
} from "../util";
import { GitHubService } from "./github-service";
import { HTTP_STATUS_CODES } from "../constants";
import { GitHubUserBuilder, UserDetailsBuilder } from "../builders";

// Mock the NetworkSimulator
vi.mock("../../lib/utils/network-simulator", () => ({
  NetworkSimulator: {
    delay: vi.fn().mockResolvedValue(undefined),
  },
}));

describe("GitHubService", () => {
  let service: GitHubService;
  let mockDataAccess: {
    findUser: ReturnType<typeof vi.fn>;
    getFollowerUsernames: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Create a mock data access object
    mockDataAccess = {
      findUser: vi.fn(),
      getFollowerUsernames: vi.fn(),
    };

    // Inject the mock as the first parameter
    service = new GitHubService(mockDataAccess as any, {
      minDelay: 0,
      maxDelay: 0,
      maxDepth: 10,
    });
  });

  describe("getUser", () => {
    it("should return user when found", async () => {
      const testUser = GitHubUserBuilder.create()
        .withLogin("testuser")
        .withId(123)
        .withFollowers(1000)
        .withCompany("TestCorp")
        .build();

      mockDataAccess.findUser.mockReturnValue(testUser);

      const result = await service.getUser("testuser");

      expect(result.status).toBe(HTTP_STATUS_CODES.OK);
      expect(result.data).toEqual(testUser);
      expect(result.data.login).toBe("testuser");
      expect(result.data.id).toBe(123);
      expect(result.data.followers).toBe(1000);
      expect(mockDataAccess.findUser).toHaveBeenCalledWith("testuser");
    });

    it("should throw UserNotFoundError when user does not exist", async () => {
      mockDataAccess.findUser.mockReturnValue(null);

      await expect(service.getUser("nonexistent")).rejects.toThrow(
        UserNotFoundError,
      );
      await expect(service.getUser("nonexistent")).rejects.toThrow(
        'User "nonexistent" not found',
      );
    });

    it("should throw InvalidUsernameError for empty username", async () => {
      await expect(service.getUser("")).rejects.toThrow(InvalidUsernameError);
      await expect(service.getUser("   ")).rejects.toThrow(
        InvalidUsernameError,
      );
    });

    it("should throw InvalidUsernameError for null/undefined username", async () => {
      await expect(service.getUser(null as any)).rejects.toThrow(
        InvalidUsernameError,
      );
      await expect(service.getUser(undefined as any)).rejects.toThrow(
        InvalidUsernameError,
      );
    });
  });

  describe("getFollowers", () => {
    const mockUsers = [
      GitHubUserBuilder.create().withLogin("wolverine").withId(1).build(),
      GitHubUserBuilder.create().withLogin("batman").withId(2).build(),
      GitHubUserBuilder.create().withLogin("spiderman").withId(3).build(),
    ];

    beforeEach(() => {
      mockDataAccess.getFollowerUsernames.mockReturnValue([
        "wolverine",
        "batman",
        "spiderman",
      ]);
      mockDataAccess.findUser.mockImplementation((username: string) => {
        return mockUsers.find((user) => user.login === username) || null;
      });
    });

    it("should return paginated followers", async () => {
      const result = await service.getFollowers("testuser", 1, 2);

      expect(result.status).toBe(HTTP_STATUS_CODES.OK);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].login).toBe("wolverine");
      expect(result.data[1].login).toBe("batman");
    });

    it("should handle second page pagination", async () => {
      const result = await service.getFollowers("testuser", 2, 2);

      expect(result.status).toBe(HTTP_STATUS_CODES.OK);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].login).toBe("spiderman");
    });

    it("should return empty array when no followers exist", async () => {
      mockDataAccess.getFollowerUsernames.mockReturnValue([]);

      const result = await service.getFollowers("testuser");

      expect(result.status).toBe(HTTP_STATUS_CODES.OK);
      expect(result.data).toHaveLength(0);
    });

    it("should filter out null users", async () => {
      mockDataAccess.getFollowerUsernames.mockReturnValue([
        "wolverine",
        "nonexistent",
        "batman",
      ]);

      const result = await service.getFollowers("testuser");

      expect(result.data).toHaveLength(2);
      expect(result.data.map((u) => u.login)).toEqual(["wolverine", "batman"]);
    });

    it("should throw InvalidPaginationError for invalid page", async () => {
      await expect(service.getFollowers("user", 0, 10)).rejects.toThrow(
        InvalidPaginationError,
      );
      await expect(service.getFollowers("user", -1, 10)).rejects.toThrow(
        InvalidPaginationError,
      );
    });

    it("should throw InvalidPaginationError for invalid perPage", async () => {
      await expect(service.getFollowers("user", 1, 0)).rejects.toThrow(
        InvalidPaginationError,
      );
      await expect(service.getFollowers("user", 1, -1)).rejects.toThrow(
        InvalidPaginationError,
      );
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

    it("should throw InvalidDepthError for negative depth", async () => {
      await expect(
        service.getFollowersWithRank("superman", -1),
      ).rejects.toThrow(InvalidDepthError);
    });

    it("should throw InvalidDepthError for non-integer depth", async () => {
      await expect(
        service.getFollowersWithRank("superman", 1.5),
      ).rejects.toThrow(InvalidDepthError);
    });

    it("should throw InvalidDepthError when depth exceeds maximum", async () => {
      await expect(
        service.getFollowersWithRank("superman", 11),
      ).rejects.toThrow(InvalidDepthError);
    });

    it("should handle depth 0 correctly", async () => {
      const user = GitHubUserBuilder.create()
        .withLogin("user")
        .withFollowers(500)
        .build();

      mockDataAccess.findUser.mockReturnValue(user);
      mockDataAccess.getFollowerUsernames.mockReturnValue(["thor", "loki"]);

      const result = await service.getFollowersWithRank("user", 0);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].login).toBe("user");
      expect(result.data[0].followersRank).toBe(0);
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
      const customDataAccess = {
        findUser: vi.fn(),
        getFollowerUsernames: vi.fn(),
      };

      const serviceWithCustomData = new GitHubService(customDataAccess as any, {
        maxDepth: 5,
        minDelay: 100,
      });

      expect(serviceWithCustomData).toBeInstanceOf(GitHubService);
    });

    it("should use injected data access without options", () => {
      const customDataAccess = {
        findUser: vi.fn(),
        getFollowerUsernames: vi.fn(),
      };

      const serviceWithCustomData = new GitHubService(customDataAccess as any);

      expect(serviceWithCustomData).toBeInstanceOf(GitHubService);
    });
  });

  describe("Error properties preservation", () => {
    it("should preserve error properties in UserNotFoundError", async () => {
      mockDataAccess.findUser.mockReturnValue(null);

      await expect(service.getUser("testuser")).rejects.toThrow(
        UserNotFoundError,
      );
      await expect(service.getUser("testuser")).rejects.toThrow(
        'User "testuser" not found',
      );
    });

    it("should preserve error properties in InvalidDepthError", async () => {
      await expect(service.getFollowersWithRank("user", -1)).rejects.toThrow(
        InvalidDepthError,
      );
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
