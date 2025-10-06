import { useMemo } from 'react';
import { useCubeQuery } from '@cubejs-client/react';
import { Query } from '@cubejs-client/core';

interface UseRetailerListOptions {
  query?: Query;
}

export function useRetailerList(options?: UseRetailerListOptions) {
  const defaultQuery: Query = {
    dimensions: ['retailers.name'],
    filters: [],
    timeDimensions: [],
    measures: []
  };

  const { resultSet, isLoading, error } = useCubeQuery(
    options?.query || defaultQuery,
    {
      resetResultSetOnChange: false, // Cache retailer list
    }
  );

  const retailers = useMemo(() => {
    if (!resultSet) return [];
    return Array.from(
      new Set(
        resultSet.tablePivot()
          .map(row => row['retailers.name'] as string)
          .filter(Boolean)
      )
    ).sort();
  }, [resultSet]);

  return { retailers, isLoading, error };
}
