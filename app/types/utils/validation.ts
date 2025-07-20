import { z } from "zod";
import { GITHUB_LIMITS } from "../../constants/github";

const GITHUB_USERNAME_PATTERN =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

export interface ValidationResult<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly errors?: Readonly<Record<string, string>>;
}

export interface BatchValidationResult<T> {
  readonly valid: readonly T[];
  readonly invalid: readonly unknown[];
  readonly successCount: number;
  readonly failureCount: number;
  readonly successRate: number;
}

export const GitHubUsernameSchema = z
  .string()
  .min(GITHUB_LIMITS.USERNAME_MIN_LENGTH, "Username is required")
  .max(
    GITHUB_LIMITS.USERNAME_MAX_LENGTH,
    `Username cannot exceed ${GITHUB_LIMITS.USERNAME_MAX_LENGTH} characters`,
  )
  .regex(GITHUB_USERNAME_PATTERN, "Invalid GitHub username format");
