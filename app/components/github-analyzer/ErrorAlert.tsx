import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";
import React from "react";

export const ErrorAlert = ({ message }: { message: string }) => (
  <Alert className="mt-6 border-red-200 bg-red-50">
    <AlertCircle className="h-4 w-4 text-red-600" />
    <AlertDescription className="text-red-800">{message}</AlertDescription>
  </Alert>
);
