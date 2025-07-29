import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { ResultGrid } from "./ResultGrid";
import { GitHubUserBuilder, UserDetailsBuilder } from "../../lib/builders";

// Only mock external hooks
vi.mock("../../hooks/useInfiniteScroll", () => ({
  useInfiniteScroll: vi.fn(() => vi.fn()),
}));

describe("ResultsGrid", () => {
  const mockUsers = [
    UserDetailsBuilder.fromBuilder(
      GitHubUserBuilder.create().withLogin("user1").withFollowers(1000),
    )
      .withFollowersRank(100)
      .build(),

    UserDetailsBuilder.fromBuilder(
      GitHubUserBuilder.create().withLogin("user2").withFollowers(2000),
    )
      .withFollowersRank(200)
      .build(),
  ];

  const defaultProps = {
    users: mockUsers,
    sortConfig: { field: "followersRank" as const, direction: "desc" as const },
    onSort: vi.fn(),
    onLoadMore: vi.fn(),
    hasMore: false,
    isLoading: false,
    isLoadingMore: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders results grid with users", () => {
    render(<ResultGrid {...defaultProps} />);

    expect(screen.getByTestId("results-grid")).toBeInTheDocument();
    expect(screen.getByTestId("results-title")).toBeInTheDocument();
    expect(screen.getByTestId("users-grid")).toBeInTheDocument();
    expect(screen.getByTestId("user-card-user1")).toBeInTheDocument();
    expect(screen.getByTestId("user-card-user2")).toBeInTheDocument();
  });

  it("shows sort controls", () => {
    render(<ResultGrid {...defaultProps} />);

    expect(screen.getByTestId("sort-controls")).toBeInTheDocument();
    expect(screen.getByTestId("sort-button-username")).toBeInTheDocument();
    expect(screen.getByTestId("sort-button-createdAt")).toBeInTheDocument();
    expect(screen.getByTestId("sort-button-followersRank")).toBeInTheDocument();
  });

  it("calls onSort when sort button clicked", () => {
    const onSort = vi.fn();
    render(<ResultGrid {...defaultProps} onSort={onSort} />);

    fireEvent.click(screen.getByTestId("sort-button-username"));

    expect(onSort).toHaveBeenCalledWith({
      field: "username",
      direction: "asc",
    });
  });

  it("toggles sort direction correctly", () => {
    const onSort = vi.fn();
    const sortConfig = {
      field: "username" as const,
      direction: "asc" as const,
    };

    render(
      <ResultGrid {...defaultProps} sortConfig={sortConfig} onSort={onSort} />,
    );

    fireEvent.click(screen.getByTestId("sort-button-username"));

    expect(onSort).toHaveBeenCalledWith({
      field: "username",
      direction: "desc",
    });
  });

  it("shows initial loading state", () => {
    render(<ResultGrid {...defaultProps} isLoading />);

    expect(screen.getByTestId("initial-loading")).toBeInTheDocument();
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("shows load more trigger when hasMore is true", () => {
    render(<ResultGrid {...defaultProps} hasMore />);

    expect(screen.getByTestId("load-more-trigger")).toBeInTheDocument();
  });

  it("shows loading more state", () => {
    render(<ResultGrid {...defaultProps} hasMore isLoadingMore />);

    expect(screen.getByTestId("load-more-trigger")).toBeInTheDocument();
    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("shows end of results message", () => {
    render(<ResultGrid {...defaultProps} users={mockUsers} hasMore={false} />);

    expect(screen.getByTestId("end-of-results")).toBeInTheDocument();
  });

  it("does not show end message when no users", () => {
    render(<ResultGrid {...defaultProps} users={[]} hasMore={false} />);

    expect(screen.queryByTestId("end-of-results")).not.toBeInTheDocument();
  });

  it("shows correct number of user cards", () => {
    render(<ResultGrid {...defaultProps} />);

    const userCards = screen.getAllByTestId(/^user-card-/);
    expect(userCards).toHaveLength(2);
  });
});
