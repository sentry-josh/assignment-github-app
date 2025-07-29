import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { SortButton } from "./SortButton";

describe("SortButton", () => {
  const defaultProps = {
    field: "username" as const,
    label: "Username",
    currentSort: {
      field: "followersRank" as const,
      direction: "desc" as const,
    },
    onSort: vi.fn(),
  };

  it("renders and handles click", () => {
    const onSort = vi.fn();
    render(<SortButton {...defaultProps} onSort={onSort} />);

    const button = screen.getByText("Username");
    fireEvent.click(button);

    expect(onSort).toHaveBeenCalledWith("username");
  });

  it("shows active state when field matches current sort", () => {
    render(
      <SortButton
        {...defaultProps}
        currentSort={{ field: "username", direction: "asc" }}
      />,
    );

    expect(screen.getByTestId("sort-button-username")).toHaveClass(
      "bg-blue-100",
    );
  });
});
