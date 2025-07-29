import { render, screen } from "@testing-library/react";
import { Loader } from "./Loader";

describe("Loader", () => {
  it("displays default loading message", () => {
    render(<Loader />);

    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("displays custom message", () => {
    render(<Loader message="Analyzing data..." />);

    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.getByText("Analyzing data...")).toBeInTheDocument();
  });

  it("shows loading spinner", () => {
    render(<Loader />);

    const loader = screen.getByTestId("loader");
    expect(loader.querySelector(".animate-spin")).toBeInTheDocument();
  });
});
