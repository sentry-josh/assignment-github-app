import { z } from "zod";
import { GitHubUsernameSchema } from "../models";
import { DepthSchema } from "../business";

export const AnalysisFormSchema = z.object({
  username: GitHubUsernameSchema,
  depth: DepthSchema,
});

export type AnalysisFormData = z.infer<typeof AnalysisFormSchema>;
