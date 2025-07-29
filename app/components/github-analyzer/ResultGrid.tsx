import { UserCard } from "./UserCard";
import { SortButton } from "./SortButton";
import { SortField, UserDetails, SORT_OPTIONS, SortOptions } from "../../lib";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { Loader } from "./Loader";

type ResultsGridProps = {
  users: UserDetails[];
  sortConfig: SortOptions;
  onSort: (sortConfig: SortOptions) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
};

export const ResultGrid = (props: ResultsGridProps) => {
  const {
    users,
    sortConfig,
    onSort,
    onLoadMore,
    hasMore,
    isLoading,
    isLoadingMore,
  } = props;

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
    <div data-testid="results-grid" className="px-6">
      <div className="flex items-center justify-between mb-6">
        <h3
          data-testid="results-title"
          className="text-xl font-semibold text-gray-900"
        >
          Search Result
        </h3>
        <div data-testid="sort-controls" className="flex flex-wrap gap-2">
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
        <div data-testid="initial-loading" className="text-center py-8">
          <Loader message="Loading users..." />
        </div>
      )}

      <div
        data-testid="users-grid"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {users.map((user, index) => (
          <UserCard key={user.login} user={user} index={index} />
        ))}
      </div>

      {hasMore && (
        <div
          ref={loadMoreRef}
          data-testid="load-more-trigger"
          className="text-center py-8"
        >
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
        <div
          data-testid="end-of-results"
          className="text-center py-8 text-gray-500"
        >
          <p>You've reached the end of the results</p>
        </div>
      )}
    </div>
  );
};
