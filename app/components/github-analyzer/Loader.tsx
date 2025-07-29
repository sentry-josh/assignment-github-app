import { Loader2 } from "lucide-react";

type LoadingProps = {
  message?: string;
};

export const Loader = ({ message = "Loading..." }: LoadingProps) => {
  return (
    <div data-testid="loader" className="text-center py-8">
      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-blue-500" />
      <p className="text-gray-600">{message}</p>
    </div>
  );
};
