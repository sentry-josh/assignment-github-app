import { render, screen } from "@testing-library/react";
import { UserCard } from "./UserCard";
import { GitHubUserBuilder, UserDetailsBuilder } from "~/lib";

describe("UserCard", () => {
  const defaultUser = UserDetailsBuilder.fromBuilder(
    GitHubUserBuilder.withLogin("joshua")
      .withFollowers(1250)
      .withCreatedAt(new Date("2020-01-15T10:30:00Z")),
  )
    .withFollowersRank(42)
    .build();

  it("renders user information correctly", () => {
    render(<UserCard user={defaultUser} index={0} />);

    expect(screen.getByTestId("username-joshua")).toHaveTextContent("@joshua");
    expect(screen.getByTestId("followers-count-joshua")).toHaveTextContent(
      "1,250 followers",
    );
    expect(screen.getByTestId("followers-rank-joshua")).toHaveTextContent("42");
  });

  it("shows rank badge with correct number", () => {
    render(<UserCard user={defaultUser} index={2} />);

    expect(screen.getByTestId("rank-badge-joshua")).toHaveTextContent("#3");
  });

  it("shows crown icon for first place", () => {
    render(<UserCard user={defaultUser} index={0} />);

    expect(screen.getByTestId("crown-icon")).toBeInTheDocument();
  });

  it("does not show crown icon for other positions", () => {
    render(<UserCard user={defaultUser} index={1} />);

    expect(screen.queryByTestId("crown-icon")).not.toBeInTheDocument();
  });

  it("creates correct GitHub profile link", () => {
    render(<UserCard user={defaultUser} index={0} />);

    const link = screen.getByTestId("profile-link-joshua");
    expect(link).toHaveAttribute("href", "https://github.com/joshua");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
