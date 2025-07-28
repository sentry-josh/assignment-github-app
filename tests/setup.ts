import { beforeEach, vi } from "vitest";
import "@testing-library/jest-dom";

beforeEach(() => {
  vi.clearAllMocks();
});

declare global {
  namespace Vi {
    interface JestAssertion<T = any> {}
  }
}

global.fetch = vi.fn();
