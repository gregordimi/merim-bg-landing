import { ReactNode, memo } from 'react';
import { useCubeQuery } from '@cubejs-client/react';
import { Query, ResultSet } from '@cubejs-client/core';

interface QueryRendererProps {
  query?: Query;
  children?: (props: {
    resultSet: ResultSet;
  }) => ReactNode;
  subscribe?: boolean;
}

export const QueryRenderer = memo(function QueryRenderer(props: QueryRendererProps) {
  const { children, query, subscribe } = props;
  const { resultSet, isLoading, error } = useCubeQuery(query ?? {}, { subscribe, skip: !query });

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (error) {
    return <div className="text-red-500 p-4 border border-red-300 rounded">
      Error: {error.toString()}
    </div>;
  }

  if (!resultSet) {
    return <div className="text-gray-500 p-4">No data available</div>;
  }

  return children?.({ resultSet }) || null;
});
