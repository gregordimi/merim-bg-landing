import { useMemo, useEffect, useState } from 'react';
import { useCubeQuery } from '@cubejs-client/react';

// Global cache to prevent duplicate queries across all components
const queryCache = new Map<string, any>();
let queryBuildCount = 0;

export function useStableQuery(queryBuilder: () => any, dependencies: any[], componentId?: string) {
  // Create a single stable string from all dependencies, including component ID to prevent cache collisions
  const stableKey = `${componentId || 'unknown'}:${dependencies.join('|')}`;
  
  // Track query timeout
  const [isTimedOut, setIsTimedOut] = useState(false);
  
  // Only rebuild query when the stable key actually changes
  const query = useMemo(() => {
    // Check if we already have this query cached
    if (queryCache.has(stableKey)) {
      console.log(`🔄 [${++queryBuildCount}] Using CACHED query for key: "${stableKey}" (React StrictMode double-mount)`);
      return queryCache.get(stableKey);
    }
    
    // Build new query and cache it
    const builtQuery = queryBuilder();
    console.log(`🆕 [${++queryBuildCount}] Building NEW query for key: "${stableKey}"`);
    console.log('Query:', JSON.stringify(builtQuery, null, 2));
    
    queryCache.set(stableKey, builtQuery);
    return builtQuery;
  }, [stableKey]);
  
  const result = useCubeQuery(query, {
    castNumerics: true,
    resetResultSetOnChange: false,
    subscribe: false,
  });
  
  // Set up timeout to prevent stuck loading states (30 seconds)
  useEffect(() => {
    if (result.isLoading) {
      setIsTimedOut(false);
      const timeout = setTimeout(() => {
        if (result.isLoading) {
          console.error(`⏰ Query timeout for key: "${stableKey}"`);
          setIsTimedOut(true);
        }
      }, 30000); // 30 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [result.isLoading, stableKey]);
  
  // Debug the actual query result
  console.log('🔍 Query result:', {
    isLoading: result.isLoading,
    error: result.error,
    isTimedOut,
    resultSet: result.resultSet ? 'HAS_DATA' : 'NO_DATA',
    progress: result.progress
  });
  
  return {
    ...result,
    isLoading: result.isLoading && !isTimedOut,
    error: result.error || (isTimedOut ? new Error('Query timeout - taking too long') : undefined),
  };
}
