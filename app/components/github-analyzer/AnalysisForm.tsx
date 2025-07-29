import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import { Loader2, Github, Zap } from "lucide-react";
import { useAnalysisForm } from "../../hooks/useAnalysisForm";
import { GITHUB_LIMITS } from "../../lib/constants";
import { ErrorAlert } from "./ErrorAlert";
import { cn } from "../../lib/utils";
import { AnalysisFormData } from "../../lib/types/ui/form";

type AnalysisFormProps = {
  isLoading: boolean;
  error?: string;
  hasResults: boolean;
  onSubmit: (data: AnalysisFormData) => void | Promise<void>;
};

export function AnalysisForm({
  isLoading,
  error,
  hasResults,
  onSubmit,
}: AnalysisFormProps) {
  const { formData, errors, updateField, handleSubmit } = useAnalysisForm();

  const handleDepthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    if (rawValue === "") {
      updateField("depth", "");
      return;
    }

    const numericValue = parseInt(rawValue, 10);
    if (!isNaN(numericValue)) {
      updateField("depth", numericValue);
    }
  };

  return (
    <div
      data-testid="analysis-form"
      className={cn(
        "max-w-lg mx-auto mb-12 transition-all duration-500",
        hasResults && "transform scale-95 opacity-90",
      )}
    >
      <Card className="shadow-lg border-0 bg-white">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-gray-900"
              >
                GitHub Username
              </Label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  data-testid="username-input"
                  id="git-user-name"
                  type="text"
                  placeholder="e.g. sentry"
                  value={formData.username}
                  onChange={(e) => updateField("username", e.target.value)}
                  className={cn(
                    "pl-10 h-12 border-gray-300 focus:border-blue-500",
                    errors.username && "border-red-300 focus:border-red-500",
                  )}
                  disabled={isLoading}
                />
              </div>
              {errors.username && (
                <p className="text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="depth"
                className="text-sm font-medium text-gray-900"
              >
                Analysis Depth ({GITHUB_LIMITS.MIN_FOLLOWER_DEPTH}-
                {GITHUB_LIMITS.MAX_FOLLOWER_DEPTH})
              </Label>
              <Input
                data-testid="depth-input"
                id="depth"
                type="number"
                value={formData.depth}
                onChange={handleDepthChange}
                className={cn(
                  "h-12 border-gray-300 focus:border-blue-500",
                  errors.depth && "border-red-300 focus:border-red-500",
                )}
                disabled={isLoading}
              />
              <p className="text-sm text-gray-500">
                Higher values provide deeper analysis but take longer to process
              </p>
              {errors.depth && (
                <p className="text-sm text-red-600">{errors.depth}</p>
              )}
            </div>

            <Button
              data-testid="submit-button"
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Network...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Analyze Followers
                </>
              )}
            </Button>
          </form>

          {error && <ErrorAlert message={error} />}
        </CardContent>
      </Card>
    </div>
  );
}
