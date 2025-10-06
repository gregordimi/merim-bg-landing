import { ReactNode } from "react";
import { useCubeQuery } from "@cubejs-client/react";
import { Query, ResultSet } from "@cubejs-client/core";
import { ChartAreaSkeleton } from "./components/ChartSkeleton";

interface QueryRendererProps {
  query?: Query;
  children?: (props: { resultSet: ResultSet }) => ReactNode;
  subscribe?: boolean;
  showSkeleton?: boolean;
}

export function QueryRenderer(props: QueryRendererProps) {
  const { children, query, subscribe, showSkeleton = true } = props;

  const { resultSet, isLoading, error } = useCubeQuery(query ?? {}, {
    subscribe,
    skip: !query,
    resetResultSetOnChange: false, // Keep cached results - prevents refetch on remount
  });

  // Show loading if still loading OR if we don't have data yet
  if (isLoading || !resultSet) {
    // Only show error if we have an error AND we're not loading
    if (error && !isLoading) {
      return (
        <div className="text-red-500 p-4 border border-red-300 rounded bg-red-50 dark:bg-red-950/20">
          <p className="font-semibold mb-1">Error loading data</p>
          <p className="text-sm">{error.toString()}</p>
        </div>
      );
    }
    
    return showSkeleton ? (
      <ChartAreaSkeleton />
    ) : (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return children?.({ resultSet }) || null;
}
