import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { AnalysisForm } from "./AnalysisForm";

const mockUseAnalysisForm = {
  formData: { username: "", depth: "" },
  errors: {},
  updateField: vi.fn(),
  handleSubmit: vi.fn((callback) => (e: Event) => {
    e.preventDefault();
    callback({ username: "testuser", depth: 2 });
  }),
};

vi.mock("../../hooks/useAnalysisForm", () => ({
  useAnalysisForm: () => mockUseAnalysisForm,
}));

describe("AnalysisForm", () => {
  const defaultProps = {
    isLoading: false,
    hasResults: false,
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    mockUseAnalysisForm.errors = {};
    vi.clearAllMocks();
  });

  it("renders all form elements", () => {
    render(<AnalysisForm {...defaultProps} />);

    expect(screen.getByTestId("username-input")).toBeInTheDocument();
    expect(screen.getByTestId("depth-input")).toBeInTheDocument();
    expect(screen.getByTestId("submit-button")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. sentry")).toBeInTheDocument();
  });

  it("calls updateField when username changes", async () => {
    const user = userEvent.setup();
    render(<AnalysisForm {...defaultProps} />);

    await user.type(screen.getByTestId("username-input"), "test");

    expect(mockUseAnalysisForm.updateField).toHaveBeenCalledWith(
      "username",
      expect.any(String),
    );
    expect(mockUseAnalysisForm.updateField).toHaveBeenCalledTimes(4);
  });

  it("calls updateField when depth changes", async () => {
    const user = userEvent.setup();
    render(<AnalysisForm {...defaultProps} />);

    const depthInput = screen.getByTestId("depth-input");
    await user.type(depthInput, "5");

    expect(mockUseAnalysisForm.updateField).toHaveBeenCalledWith("depth", 5);
  });

  it("submits form with data", () => {
    const onSubmit = vi.fn();
    render(<AnalysisForm {...defaultProps} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByTestId("submit-button"));

    expect(onSubmit).toHaveBeenCalledWith({ username: "testuser", depth: 2 });
  });

  it("disables form when loading", () => {
    render(<AnalysisForm {...defaultProps} isLoading />);

    expect(screen.getByText(/analyzing network/i)).toBeInTheDocument();
    expect(screen.getByTestId("submit-button")).toBeDisabled();
    expect(screen.getByTestId("username-input")).toBeDisabled();
    expect(screen.getByTestId("depth-input")).toBeDisabled();
  });

  it("shows validation errors", () => {
    mockUseAnalysisForm.errors = {
      username: "Username is required",
      depth: "Invalid depth value",
    };
    render(<AnalysisForm {...defaultProps} />);

    expect(screen.getByText("Username is required")).toBeInTheDocument();
    expect(screen.getByText("Invalid depth value")).toBeInTheDocument();
    expect(screen.getByTestId("username-input")).toHaveClass("border-red-300");
    expect(screen.getByTestId("depth-input")).toHaveClass("border-red-300");
  });

  it("shows API error", () => {
    render(<AnalysisForm {...defaultProps} error="Failed to fetch data" />);

    expect(screen.getByText("Failed to fetch data")).toBeInTheDocument();
  });

  it("scales when results exist", () => {
    render(<AnalysisForm {...defaultProps} hasResults />);

    const container = screen.getByTestId("analysis-form");
    expect(container).toHaveClass("transform", "scale-95", "opacity-90");
  });
});
