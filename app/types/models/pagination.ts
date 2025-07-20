import { z } from "zod";
import { PAGINATION_LIMITS } from "../../constants/pagination";

export const PaginationParamsSchema = z.object({
  page: z
    .number()
    .min(PAGINATION_LIMITS.MIN_PAGE)
    .optional()
    .default(PAGINATION_LIMITS.MIN_PAGE),
  perPage: z
    .number()
    .min(PAGINATION_LIMITS.MIN_PER_PAGE)
    .max(PAGINATION_LIMITS.MAX_PER_PAGE)
    .optional()
    .default(PAGINATION_LIMITS.DEFAULT_PER_PAGE),
});

export const PaginationInfoSchema = z.object({
  page: z.number().min(PAGINATION_LIMITS.MIN_PAGE),
  perPage: z
    .number()
    .min(PAGINATION_LIMITS.MIN_PER_PAGE)
    .max(PAGINATION_LIMITS.MAX_PER_PAGE),
  totalCount: z.number().nonnegative(),
  totalPages: z.number().nonnegative(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export const PaginationConfigSchema = z.object({
  defaultPageSize: z
    .number()
    .min(PAGINATION_LIMITS.MIN_PER_PAGE)
    .max(PAGINATION_LIMITS.MAX_PER_PAGE)
    .default(PAGINATION_LIMITS.DEFAULT_PER_PAGE),
  maxPageSize: z
    .number()
    .min(PAGINATION_LIMITS.MIN_PER_PAGE)
    .max(PAGINATION_LIMITS.MAX_PER_PAGE)
    .default(PAGINATION_LIMITS.MAX_PER_PAGE),
  pageSizeOptions: z
    .array(z.number().min(1))
    .default([...PAGINATION_LIMITS.DEFAULT_PAGE_SIZE_OPTIONS]),
  showPageSizeSelector: z.boolean().default(true),
});

export const PaginatedResponseSchema = <T>(itemSchema: z.ZodType<T>) =>
  z.object({
    items: z.array(itemSchema),
    pagination: PaginationInfoSchema,
  });

export type PaginatedResponse<T> = {
  items: T[];
  pagination: PaginationInfo;
};
export type PaginationParams = z.infer<typeof PaginationParamsSchema>;
export type PaginationInfo = z.infer<typeof PaginationInfoSchema>;
export type PaginationConfig = z.infer<typeof PaginationConfigSchema>;
