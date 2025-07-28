import { z } from "zod";
import {
  type ValidationResult,
  type BatchValidationResult,
} from "../types/utils/validation";

const VALIDATION_MESSAGES = {
  VALIDATION_FAILED: "Validation failed",
  INVALID_API_RESPONSE: "Invalid API response structure",
} as const;

export const parseZodErrors = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};

  error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    errors[path] = issue.message;
  });

  return errors;
};

export const validateWithSchema = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): ValidationResult<T> => {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: parseZodErrors(error),
      };
    }
    return {
      success: false,
      errors: { general: VALIDATION_MESSAGES.VALIDATION_FAILED },
    };
  }
};

export const safeParse = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): T | null => {
  const result = schema.safeParse(data);
  return result.success ? result.data : null;
};

export const validateApiResponse = <T>(
  schema: z.ZodSchema<T>,
  response: unknown,
  fallback?: T,
): T => {
  const result = safeParse(schema, response);

  if (result === null) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(VALIDATION_MESSAGES.INVALID_API_RESPONSE);
  }

  return result;
};

export const validateBatch = <T>(
  schema: z.ZodSchema<T>,
  items: readonly unknown[],
): BatchValidationResult<T> => {
  const valid: T[] = [];
  const invalid: unknown[] = [];

  for (const item of items) {
    const result = safeParse(schema, item);
    if (result !== null) {
      valid.push(result);
    } else {
      invalid.push(item);
    }
  }

  const successCount = valid.length;
  const failureCount = invalid.length;
  const totalCount = items.length;
  const successRate = totalCount > 0 ? successCount / totalCount : 0;

  return {
    valid: Object.freeze(valid),
    invalid: Object.freeze(invalid),
    successCount,
    failureCount,
    successRate,
  };
};

export const isValidationSuccess = <T>(
  result: ValidationResult<T>,
): result is ValidationResult<T> & { success: true; data: T } => {
  return result.success === true && result.data !== undefined;
};
