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
