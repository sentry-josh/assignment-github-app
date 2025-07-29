import React, { useRef, useEffect, useCallback } from "react";
import { MetaFunction } from "@remix-run/react";
import { PageHeader } from "../components/github-analyzer/PageHeader";
import { AnalysisForm } from "../components/github-analyzer/AnalysisForm";
import { StickyHeader } from "../components/github-analyzer/StickyHeader";
import { ResultGrid } from "../components/github-analyzer/ResultGrid";
import { useGitHubAnalysis } from "../hooks/useGitHubAnalysis";
import { useScrollToElement } from "../hooks/useScrollToElement";

export const meta: MetaFunction = () => {
  return [
    { title: "GitHub Followers Analyzer" },
    {
      name: "description",
      content: "Analyze GitHub followers network with depth ranking",
    },
  ];
};

const SCROLL_DELAY_MS = 100;

export default function Index() {
  const {
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
  } = useGitHubAnalysis();

  const scrollToElement = useScrollToElement();

  const resultsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToResults = useCallback(() => {
    scrollToElement(resultsRef.current);
  }, [scrollToElement]);

  const scrollToForm = useCallback(() => {
    scrollToElement(formRef.current);
  }, [scrollToElement]);

  useEffect(() => {
    if (results && !isLoading) {
      const timeoutId = setTimeout(scrollToResults, SCROLL_DELAY_MS);
      return () => clearTimeout(timeoutId);
    }
  }, [results, isLoading, scrollToResults]);

  const hasResults = results !== null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <PageHeader />

        <div ref={formRef}>
          <AnalysisForm
            isLoading={isLoading}
            error={error}
            hasResults={hasResults}
            onSubmit={analyze}
          />
        </div>

        {hasResults && (
          <div
            ref={resultsRef}
            className="space-y-0 animate-in fade-in-50 slide-in-from-bottom-4 duration-700"
          >
            <StickyHeader
              totalUsers={results.totalUsers}
              rootUser={results.rootUser}
              depth={results.depth}
              onSearch={scrollToForm}
            />

            <ResultGrid
              users={displayedUsers}
              sortConfig={sortConfig}
              onSort={updateSort}
              onLoadMore={loadMore}
              hasMore={hasMore}
              isLoading={isLoading}
              isLoadingMore={isLoadingMore}
            />
          </div>
        )}

        <footer className="text-center mt-16 text-gray-500">
          <p>Analyze GitHub follower networks to discover influential users</p>
        </footer>
      </div>
    </div>
  );
}
