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

  if (isLoading) {
    return showSkeleton ? (
      <ChartAreaSkeleton />
    ) : (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-300 rounded bg-red-50 dark:bg-red-950/20">
        <p className="font-semibold mb-1">Error loading data</p>
        <p className="text-sm">{error.toString()}</p>
      </div>
    );
  }

  if (!resultSet) {
    return (
      <div className="text-muted-foreground p-8 text-center border rounded-lg bg-muted/20">
        No data available
      </div>
    );
  }

  return children?.({ resultSet }) || null;
}
