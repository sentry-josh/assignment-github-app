import { render, screen } from "@testing-library/react";
import { ErrorAlert } from "./ErrorAlert";

describe("ErrorAlert", () => {
  it("displays error message", () => {
    render(<ErrorAlert message="Something went wrong" />);

    expect(screen.getByTestId("error-alert")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("shows error icon", () => {
    render(<ErrorAlert message="Error occurred" />);

    const alert = screen.getByTestId("error-alert");
    expect(alert).toHaveClass("border-red-200", "bg-red-50");
  });
});
