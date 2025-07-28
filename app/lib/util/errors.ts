import { HTTP_STATUS_CODES } from "../constants";

export abstract class GitHubServiceError extends Error {
  abstract readonly statusCode: number;
  abstract readonly errorCode: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UserNotFoundError extends GitHubServiceError {
  readonly statusCode = HTTP_STATUS_CODES.NOT_FOUND;
  readonly errorCode = "USER_NOT_FOUND";

  constructor(public readonly username: string) {
    super(`User "${username}" not found`);
  }
}

export abstract class ValidationError extends GitHubServiceError {
  readonly statusCode = HTTP_STATUS_CODES.BAD_REQUEST;

  constructor(message: string, public readonly field?: string) {
    super(message);
  }
}

export class InvalidDepthError extends ValidationError {
  readonly errorCode = "INVALID_DEPTH";

  constructor(public readonly depth: number, public readonly maxDepth: number) {
    super(
      `Depth must be between 0 and ${maxDepth}, received ${depth}`,
      "depth",
    );
  }
}

export class InvalidPaginationError extends ValidationError {
  readonly errorCode = "INVALID_PAGINATION";

  constructor(public readonly page: number, public readonly perPage: number) {
    super(`Invalid pagination: page=${page}, perPage=${perPage}`, "pagination");
  }
}

export class InvalidUsernameError extends ValidationError {
  readonly errorCode = "INVALID_USERNAME";

  constructor(username: string) {
    super("Username is required and cannot be empty", "username");
  }
}

export class GenericValidationError extends ValidationError {
  readonly errorCode = "VALIDATION_ERROR";

  constructor(message: string, field?: string) {
    super(message, field);
  }
}

export function isGitHubServiceError(
  error: unknown,
): error is GitHubServiceError {
  return error instanceof GitHubServiceError;
}

export function isUserNotFoundError(
  error: unknown,
): error is UserNotFoundError {
  return error instanceof UserNotFoundError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export const handleError = (error: unknown, username: string) => {
  if (error instanceof UserNotFoundError) {
    return `User not found. Please check the username.`;
  }
  if (error instanceof InvalidUsernameError) {
    return "Please enter a valid username.";
  }
  if (error instanceof InvalidDepthError) {
    return "Invalid depth value. Please use a number between 0 and the maximum allowed.";
  }
  return "Failed to analyze followers. Please try again.";
};
