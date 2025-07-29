import { render, screen } from "@testing-library/react";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("displays default title and subtitle", () => {
    render(<PageHeader />);

    expect(screen.getByTestId("page-header")).toBeInTheDocument();
    expect(screen.getByTestId("page-title")).toHaveTextContent(
      "GitHub Network Analyzer",
    );
    expect(screen.getByTestId("page-subtitle")).toHaveTextContent(
      "Discover influential users",
    );
  });

  it("displays custom title and subtitle", () => {
    render(<PageHeader title="Custom Title" subtitle="Custom subtitle" />);

    expect(screen.getByTestId("page-title")).toHaveTextContent("Custom Title");
    expect(screen.getByTestId("page-subtitle")).toHaveTextContent(
      "Custom subtitle",
    );
  });
});
