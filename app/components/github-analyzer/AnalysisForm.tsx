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

interface AnalysisFormProps {
  isLoading: boolean;
  error?: string;
  hasResults: boolean;
  onSubmit: (data: AnalysisFormData) => void | Promise<void>;
}

export function AnalysisForm(props: AnalysisFormProps) {
  const { isLoading, error, hasResults, onSubmit } = props;
  const { formData, errors, updateField, handleSubmit } = useAnalysisForm();

  const usernameError = errors.username;
  const depthError = errors.depth;

  const handleDepthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || GITHUB_LIMITS.MIN_FOLLOWER_DEPTH;
    updateField("depth", value);
  };

  return (
    <div
      className={cn(
        "max-w-lg mx-auto mb-12 transition-all duration-500",
        hasResults && "transform scale-95 opacity-90",
      )}
    >
      <Card className="shadow-lg border-0 bg-white">
        <CardContent className="p-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            noValidate
          >
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-gray-900"
              >
                GitHub Username [e.g sentry]
              </Label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="github username"
                  value={formData.username}
                  onChange={(e) => updateField("username", e.target.value)}
                  className={cn(
                    "pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 autofill:bg-white autofill:[-webkit-text-fill-color:black]",
                    errors.username &&
                      "border-red-300 focus:border-red-500 focus:ring-red-500",
                  )}
                  disabled={isLoading}
                  aria-invalid={!!errors.username}
                  aria-describedby={
                    depthError ? "depth-error depth-help" : "depth-help"
                  }
                />
              </div>
              {usernameError && (
                <p id="username-error" className="text-sm text-red-600">
                  {usernameError}
                </p>
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
                id="depth"
                type="number"
                min={GITHUB_LIMITS.MIN_FOLLOWER_DEPTH}
                max={GITHUB_LIMITS.MAX_FOLLOWER_DEPTH}
                value={formData.depth}
                onChange={handleDepthChange}
                className={cn(
                  "h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                  depthError &&
                    "border-red-300 focus:border-red-500 focus:ring-red-500",
                )}
                disabled={isLoading}
                aria-invalid={Boolean(depthError)}
                aria-describedby="depth-help depth-error"
              />
              <p id="depth-help" className="text-sm text-gray-500">
                Higher values provide deeper analysis but take longer to process
              </p>
              {depthError && (
                <p id="depth-error" className="text-sm text-red-600">
                  {depthError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium border-0 disabled:opacity-50"
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
                  Fetch Ranked Users
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
