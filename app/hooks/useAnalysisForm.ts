import { useState } from "react";
import {
  validateWithSchema,
  isValidationSuccess,
} from "../lib/util/validation";
import {
  AnalysisFormSchema,
  type AnalysisFormData,
} from "../lib/types/ui/form";
import { GITHUB_LIMITS } from "../lib";

export const useAnalysisForm = () => {
  const [formData, setFormData] = useState<AnalysisFormData>({
    username: "",
    depth: GITHUB_LIMITS.MIN_FOLLOWER_DEPTH,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false);

  const validate = () => {
    const result = validateWithSchema(AnalysisFormSchema, formData);

    if (isValidationSuccess(result)) {
      setErrors({});
      return { isValid: true, data: result.data };
    }

    setErrors(result.errors || {});
    return { isValid: false, errors: result.errors };
  };

  const updateField = (field: keyof AnalysisFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => {
        const { [field]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = (
    onSubmit: (data: AnalysisFormData) => void | Promise<void>,
  ) => {
    return async (e: React.FormEvent) => {
      e.preventDefault();
      setTouched(true);

      const validation = validate();
      if (validation.isValid && validation.data) {
        await onSubmit(validation.data);
      }
    };
  };

  return {
    formData,
    errors,
    updateField,
    handleSubmit,
    isValid: Object.keys(errors).length === 0 && touched,
    hasErrors: Object.keys(errors).length > 0,
  };
};
