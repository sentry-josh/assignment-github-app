import { useCallback, useState } from "react";
import {
  AnalysisResults,
  GitHubService,
  handleError,
  SortOptions,
  AnalysisFormData,
  UserDetails,
  ITEMS_PER_PAGE,
  GitHubAPIResponse,
} from "../lib";

export const useGitHubAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState("");
  const [sortConfig, setSortConfig] = useState<SortOptions>({
    field: "followersRank",
    direction: "desc",
  });
  const [displayedUsers, setDisplayedUsers] = useState<UserDetails[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const githubService = new GitHubService();

  const withLoading = async (
    fn: () => Promise<void>,
    setLoadingState: (loading: boolean) => void,
    errorContext: string,
  ) => {
    setLoadingState(true);
    setError("");

    try {
      await fn();
    } catch (error) {
      setError(handleError(error, errorContext));
    } finally {
      setLoadingState(false);
    }
  };

  const resetState = () => {
    setResults(null);
    setDisplayedUsers([]);
    setCurrentPage(1);
    setHasMore(false);
  };

  const updateUserState = (
    response: GitHubAPIResponse<UserDetails[]>,
    append = false,
  ) => {
    if (append) {
      setDisplayedUsers((prev) => [...prev, ...response.data]);
    } else {
      setDisplayedUsers(response.data);
    }
    setHasMore(response.meta?.hasMore || false);
  };

  const analyze = useCallback(
    async (formData: AnalysisFormData) => {
      const { username, depth } = formData;

      if (!username?.trim()) {
        setError("Username is required");
        return;
      }

      await withLoading(
        async () => {
          resetState();

          const response = await githubService.getFollowersWithRank(
            username,
            depth,
            sortConfig,
            1,
            ITEMS_PER_PAGE,
          );

          updateUserState(response);
          setCurrentPage(1);
          setResults({
            totalUsers: response.meta?.totalCount || 0,
            rootUser: username,
            depth,
          });
        },
        setIsLoading,
        username,
      );
    },
    [sortConfig],
  );

  const updateSort = useCallback(
    async (newSortConfig: SortOptions) => {
      if (!results) return;

      await withLoading(
        async () => {
          setSortConfig(newSortConfig);
          setCurrentPage(1);

          const response = await githubService.getFollowersWithRank(
            results.rootUser,
            results.depth,
            newSortConfig,
            1,
            ITEMS_PER_PAGE,
          );

          updateUserState(response);
        },
        setIsLoading,
        results.rootUser,
      );
    },
    [results],
  );

  const loadMore = useCallback(async () => {
    if (!results || !hasMore || isLoadingMore) return;

    await withLoading(
      async () => {
        const nextPage = currentPage + 1;
        const response = await githubService.getFollowersWithRank(
          results.rootUser,
          results.depth,
          sortConfig,
          nextPage,
          ITEMS_PER_PAGE,
        );

        updateUserState(response, true);
        setCurrentPage(nextPage);
      },
      setIsLoadingMore,
      results.rootUser,
    );
  }, [results, hasMore, isLoadingMore, currentPage, sortConfig]);

  const resetResults = useCallback(() => {
    resetState();
    setError("");
    setSortConfig({
      field: "followersRank",
      direction: "desc",
    });
  }, []);

  return {
    isLoading,
    isLoadingMore,
    results,
    error,
    sortConfig,
    displayedUsers,
    hasMore,
    analyze,
    updateSort,
    loadMore,
    resetResults,
  };
};
