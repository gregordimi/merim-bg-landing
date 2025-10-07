import { useMemo } from 'react';
import { useCubeQuery } from '@cubejs-client/react';

export function useStableQuery(queryBuilder: () => any, dependencies: any[]) {
  // Convert all dependencies to stable strings
  const stableDeps = dependencies.map(dep => {
    if (Array.isArray(dep)) return dep.join(',');
    if (typeof dep === 'object') return JSON.stringify(dep);
    return String(dep);
  });

  const query = useMemo(queryBuilder, stableDeps);
  
  return useCubeQuery(query, {
    castNumerics: true,
    resetResultSetOnChange: false,
    subscribe: false,
  });
}
