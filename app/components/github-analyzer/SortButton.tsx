import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../../lib/utils";
import { SortField, SortOptions } from "../../lib";

type SortButtonProps = {
  field: SortField;
  label: string;
  currentSort: SortOptions;
  onSort: (field: SortField) => void;
};

export const SortButton = (props: SortButtonProps) => {
  const { field, label, currentSort, onSort } = props;
  const isActive = currentSort.field === field;
  const direction = isActive ? currentSort.direction : null;

  return (
    <button
      data-testid={`sort-button-${field}`}
      onClick={() => onSort(field)}
      className={cn(
        "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg",
        "transition-colors duration-200",
        isActive
          ? "bg-blue-100 text-blue-700"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200",
      )}
    >
      {label}
      {direction === "asc" && <ChevronUp className="h-4 w-4" />}
      {direction === "desc" && <ChevronDown className="h-4 w-4" />}
      {!isActive && <ArrowUpDown className="h-4 w-4 opacity-50" />}
    </button>
  );
};
