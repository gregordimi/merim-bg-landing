import { useMemo, useRef, useEffect } from "react";
import { useCubeQuery, UseCubeQueryResult } from "@cubejs-client/react";
import { Query } from "@cubejs-client/core";

export function useStableQuery(
  queryBuilder: () => Query,
  dependencies: any[],
  componentId?: string
): UseCubeQueryResult<Query, any> {
  // Track if we've ever successfully loaded data
  const hasLoadedOnce = useRef(false);
  
  // Simple memoization based on dependencies only
  const query = useMemo(() => {
    const builtQuery = queryBuilder();
    console.log(
      `🆕 Building query for ${componentId}:`,
      JSON.stringify(builtQuery, null, 2)
    );
    return builtQuery;
  }, dependencies);

  const result = useCubeQuery(query, {
    castNumerics: true,
    resetResultSetOnChange: false,
    subscribe: false,
  });

  // Track successful loads
  useEffect(() => {
    if (result.resultSet && !result.isLoading && !result.error) {
      hasLoadedOnce.current = true;
    }
  }, [result.resultSet, result.isLoading, result.error]);

  console.log(`🔍 ${componentId} result:`, {
    isLoading: result.isLoading,
    error: result.error?.message,
    hasData: !!result.resultSet,
    progress: result.progress,
    hasLoadedOnce: hasLoadedOnce.current,
  });

  return result;
}
