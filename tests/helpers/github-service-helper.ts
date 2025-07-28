import { GitHubService } from "../../app/lib/services";
import { NetworkSimulator } from "../../app/lib/utils";
import { vi } from "vitest";

export class GitHubServiceTestHelper {
  static createTestService(): GitHubService {
    return new GitHubService({
      minDelay: 0,
      maxDelay: 0,
      maxDepth: 10,
    });
  }

  static mockNetworkSimulator() {
    vi.mocked(NetworkSimulator.delay).mockResolvedValue(undefined);
  }

  static setupCommonMocks() {
    this.mockNetworkSimulator();
  }
}
