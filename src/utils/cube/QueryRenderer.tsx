import { ReactNode } from "react";
import { useCubeQuery } from "@cubejs-client/react";
import { Query, ResultSet } from "@cubejs-client/core";
import { ChartAreaSkeleton } from "./components/ChartSkeleton";

interface QueryRendererProps {
  query: Query;
  children: (props: { resultSet: ResultSet }) => ReactNode;
}

export function QueryRenderer({ query, children }: QueryRendererProps) {
  const { resultSet, isLoading, error } = useCubeQuery(query);

  console.log('QueryRenderer:', { isLoading, hasResultSet: !!resultSet, error });

  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-300 rounded">
        <strong>Error:</strong> {error.toString()}
      </div>
    );
  }

  if (isLoading) {
    return <ChartAreaSkeleton />;
  }

  if (!resultSet) {
    return <div className="p-8">No data</div>;
  }

  return children({ resultSet });
}
