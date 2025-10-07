import { useMemo } from 'react';
import { GlobalFilters } from '@/pages/DashboardPage';
import { useStableQuery } from '@/hooks/useStableQuery';
import { buildFilters, buildTimeDimensions } from '@/utils/queryHelpers';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardsProps {
  globalFilters: GlobalFilters;
}

export function StatsCards({ globalFilters }: StatsCardsProps) {
  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => ({
      measures: [
        "prices.minRetailPrice",
        "prices.maxRetailPrice", 
        "prices.medianRetailPrice",
      ],
      filters: buildFilters(globalFilters),
      timeDimensions: buildTimeDimensions(globalFilters.dateRange),
    }),
    [globalFilters.retailers, globalFilters.locations, globalFilters.categories, globalFilters.dateRange]
  );

  const statsData = useMemo(() => {
    if (!resultSet) return { minPrice: 0, maxPrice: 0, medianPrice: 0 };
    
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return { minPrice: 0, maxPrice: 0, medianPrice: 0 };

    const data = pivot[0];
    return {
      minPrice: data?.["prices.minRetailPrice"] || 0,
      maxPrice: data?.["prices.maxRetailPrice"] || 0,
      medianPrice: data?.["prices.medianRetailPrice"] || 0,
    };
  }, [resultSet]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium text-muted-foreground">Minimum Price</p>
          <p className="text-3xl font-bold mt-2">
            {isLoading
              ? progress?.stage?.stage || "Loading..."
              : `${Number(statsData.minPrice).toFixed(2)} лв`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium text-muted-foreground">Median Price</p>
          <p className="text-3xl font-bold mt-2">
            {isLoading
              ? progress?.stage?.stage || "Loading..."
              : `${Number(statsData.medianPrice).toFixed(2)} лв`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium text-muted-foreground">Maximum Price</p>
          <p className="text-3xl font-bold mt-2">
            {isLoading
              ? progress?.stage?.stage || "Loading..."
              : `${Number(statsData.maxPrice).toFixed(2)} лв`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
