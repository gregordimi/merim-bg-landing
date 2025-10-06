import { useState, useEffect, useMemo } from 'react';
import { useCubeQuery } from '@cubejs-client/react';

export function useRetailerList() {
  const { resultSet, isLoading, error } = useCubeQuery({
    dimensions: ['retailers.name'],
    filters: [],
    timeDimensions: [],
    measures: []
  });

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
