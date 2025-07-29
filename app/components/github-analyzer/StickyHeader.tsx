import { Button } from "../ui/button";
import { CheckCircle2, Search } from "lucide-react";

type StickyHeaderProps = {
  totalUsers: number;
  rootUser: string;
  depth: number;
  onSearch: () => void;
};

export const StickyHeader = (props: StickyHeaderProps) => {
  const { totalUsers, rootUser, depth, onSearch } = props;
  return (
    <div
      data-testid="sticky-header"
      className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm mb-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-6">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <div
              data-testid="completion-status"
              className="font-medium text-gray-900"
            >
              Analysis Complete
            </div>
            <div
              data-testid="analysis-summary"
              className="text-sm text-gray-600"
            >
              <span data-testid="total-users">{totalUsers}</span> users found
              for <strong data-testid="root-user">@{rootUser}</strong> (depth:{" "}
              <span data-testid="analysis-depth">{depth}</span>)
            </div>
          </div>
        </div>
        <Button
          data-testid="new-search-button"
          variant="outline"
          onClick={onSearch}
          className="text-gray-700 hover:text-gray-900 border-gray-300"
        >
          <Search className="w-4 h-4 mr-2" />
          New Search
        </Button>
      </div>
    </div>
  );
};
