import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { StickyHeader } from "./StickyHeader";

describe("StickyHeader", () => {
  const defaultProps = {
    totalUsers: 150,
    rootUser: "joshua",
    depth: 3,
    onSearch: vi.fn(),
  };

  it("renders analysis summary correctly", () => {
    render(<StickyHeader {...defaultProps} />);

    expect(screen.getByTestId("total-users")).toHaveTextContent("150");
    expect(screen.getByTestId("root-user")).toHaveTextContent("@joshua");
    expect(screen.getByTestId("analysis-depth")).toHaveTextContent("3");
  });

  it("calls onSearch when button is clicked", () => {
    const onSearch = vi.fn();
    render(<StickyHeader {...defaultProps} onSearch={onSearch} />);

    fireEvent.click(screen.getByText("New Search"));

    expect(onSearch).toHaveBeenCalled();
  });
});
