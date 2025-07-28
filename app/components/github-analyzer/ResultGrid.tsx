import React from "react";
import { UserCard } from "./UserCard";
import { SortButton } from "./SortButton";
import { SortField, UserDetails, SORT_OPTIONS, SortOptions } from "../../lib";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { Loader } from "./Loader";

interface ResultsGridProps {
  users: UserDetails[];
  sortConfig: SortOptions;
  onSort: (sortConfig: SortOptions) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
}

export function ResultsGrid({
  users,
  sortConfig,
  onSort,
  onLoadMore,
  hasMore,
  isLoading,
  isLoadingMore,
}: ResultsGridProps) {
  const handleSort = (field: SortField) => {
    const newDirection =
      sortConfig.field === field && sortConfig.direction === "asc"
        ? "desc"
        : "asc";

    onSort({ field, direction: newDirection });
  };

  const canLoadMore = hasMore && !isLoading && !isLoadingMore;
  const loadMoreRef = useInfiniteScroll(onLoadMore, canLoadMore);

  return (
    <div className="px-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Search Result</h3>
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 font-medium py-2">
            Sort by:
          </span>
          {SORT_OPTIONS.map(({ field, label }) => (
            <SortButton
              key={field}
              field={field}
              label={label}
              currentSort={sortConfig}
              onSort={handleSort}
            />
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <Loader message="Loading users..." />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user, index) => (
          <UserCard key={user.login} user={user} index={index} />
        ))}
      </div>

      {hasMore && (
        <div ref={loadMoreRef} className="text-center py-8">
          {isLoadingMore ? (
            <Loader message="Loading more results..." />
          ) : (
            <div className="text-gray-400">
              <p>Scroll for more results</p>
            </div>
          )}
        </div>
      )}

      {!hasMore && users.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>You've reached the end of the results</p>
        </div>
      )}
    </div>
  );
}
