import { useMemo } from "react";
import { useCubeQuery } from "@cubejs-client/react";
import { Query } from "@cubejs-client/core";

interface UseRetailerListOptions {
  query?: Query;
}

export function useRetailerList(options?: UseRetailerListOptions) {
  const defaultQuery: Query = {
    dimensions: ["retailers.name"],
    filters: [],
    timeDimensions: [],
    measures: [],
  };

  const { resultSet, isLoading, error } = useCubeQuery(
    options?.query || defaultQuery
  );

  const retailers = useMemo(() => {
    if (!resultSet) return [];
    const pivot = resultSet.tablePivot();
    console.log("useRetailerList pivot:", pivot);
    const names = Array.from(
      new Set(
        pivot.map((row) => row["retailers.name"] as string).filter(Boolean)
      )
    ).sort();
    console.log("useRetailerList retailers:", names);
    return names;
  }, [resultSet]);

  return { retailers, isLoading, error };
}
