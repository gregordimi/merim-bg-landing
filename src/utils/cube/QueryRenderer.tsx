import { ReactNode, useEffect, useRef } from "react";
import { useCubeQuery } from "@cubejs-client/react";
import { Query, ResultSet } from "@cubejs-client/core";
import { ChartAreaSkeleton } from "./components/ChartSkeleton";

interface QueryRendererProps {
  query: Query;
  children: (props: { resultSet: ResultSet }) => ReactNode;
}

export function QueryRenderer({ query, children }: QueryRendererProps) {
  const { resultSet, isLoading, error, progress } = useCubeQuery(query);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isLoading) {
      timeoutRef.current = setTimeout(() => {
        console.error("Query stuck loading for 10s:", {
          query,
          progress,
          error,
        });
      }, 10000);
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isLoading, query, progress, error]);

  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-300 rounded">
        <strong>Error:</strong> {error.toString()}
      </div>
    );
  }

  if (isLoading || !resultSet) {
    return <ChartAreaSkeleton />;
  }

  return children({ resultSet });
}
