import { useMemo, useState, useEffect } from 'react';
import { GlobalFilters, buildFilters, buildTimeDimensions } from '@/utils/cube/filterUtils';
import { useStableQuery } from '@/hooks/useStableQuery';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardsProps {
  globalFilters: GlobalFilters;
}

interface StatsData {
  minPrice: number;
  maxPrice: number;
}

export function StatsCards({ globalFilters }: StatsCardsProps) {
  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => ({
      measures: [
        "prices.minRetailPrice",
        "prices.maxRetailPrice",
      ],
      filters: buildFilters(globalFilters),
      timeDimensions: buildTimeDimensions(globalFilters.dateRange),
    }),
    [
      (globalFilters.retailers || []).join(','),
      (globalFilters.settlements || []).join(','),
      (globalFilters.municipalities || []).join(','),
      (globalFilters.categories || []).join(','),
      (globalFilters.dateRange || []).join(',')
    ],
    'stats-cards'
  );

  // Keep track of the last valid data to prevent showing zeros
  const [lastValidData, setLastValidData] = useState<StatsData | null>(null);
  const [hasEverLoaded, setHasEverLoaded] = useState(false);

  const statsData = useMemo(() => {
    if (!resultSet) return null;
    
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return null;

    const data = pivot[0];
    const newData = {
      minPrice: Number(data?.["prices.minRetailPrice"] || 0),
      maxPrice: Number(data?.["prices.maxRetailPrice"] || 0),
    };

    return newData;
  }, [resultSet]);

  // Update last valid data when we get new data
  useEffect(() => {
    if (statsData && !isLoading) {
      setLastValidData(statsData);
      setHasEverLoaded(true);
    }
  }, [statsData, isLoading]);

  // Determine what data to display
  const displayData = statsData || lastValidData;
  const shouldShowLoading = isLoading && !hasEverLoaded;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium text-muted-foreground">Minimum Price</p>
          <p className="text-3xl font-bold mt-2">
            {shouldShowLoading
              ? "Loading..."
              : displayData
              ? `${Number(displayData.minPrice).toFixed(2)} лв`
              : "No data"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium text-muted-foreground">Maximum Price</p>
          <p className="text-3xl font-bold mt-2">
            {shouldShowLoading
              ? "Loading..."
              : displayData
              ? `${Number(displayData.maxPrice).toFixed(2)} лв`
              : "No data"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
