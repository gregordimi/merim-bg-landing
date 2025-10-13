import { useMemo } from 'react';
import { GlobalFilters, buildOptimizedQuery } from '@/utils/cube/filterUtils';
import { useStableQuery } from '@/hooks/useStableQuery';
import { ChartWrapper } from '../../config/ChartWrapper';

interface DiscountChartProps {
  globalFilters: GlobalFilters;
}

interface ChartDataPoint {
  retailer: string;
  discount: number;
}

function processDiscountData(resultSet: any) {
  if (!resultSet) return [];

  try {
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return [];

    const retailerMap = new Map<string, { discount: number; count: number }>();
    
    pivot.forEach((row: any) => {
      const retailer = row["prices.retailer_name"];
      const discount = Number(row["prices.averageDiscountPercentage"] || 0);
      
      if (!retailer) return;
      
      if (retailerMap.has(retailer)) {
        const existing = retailerMap.get(retailer)!;
        existing.discount = (existing.discount * existing.count + discount) / (existing.count + 1);
        existing.count += 1;
      } else {
        retailerMap.set(retailer, { discount, count: 1 });
      }
    });

    return Array.from(retailerMap.entries())
      .map(([retailer, data]) => ({
        retailer,
        discount: data.discount,
      }))
      .sort((a: ChartDataPoint, b: ChartDataPoint) => b.discount - a.discount);
  } catch (error) {
    console.error("Error processing discount data:", error);
    return [];
  }
}

export function DiscountChart({ globalFilters }: DiscountChartProps) {
  const query = useMemo(() => {
    // For DiscountChart, we need to ensure retailer dimension is always included
    // even when retailers are filtered, to show breakdown by retailer
    const query = buildOptimizedQuery(
      ["prices.averageDiscountPercentage"],
      globalFilters,
      [] // Don't pass additional dimensions here
    );
    
    // Force include retailer dimension for this chart
    if (!query.dimensions) {
      query.dimensions = [];
    }
    if (!query.dimensions.includes("prices.retailer_name")) {
      query.dimensions.push("prices.retailer_name");
    }
    
    return query;
  }, [globalFilters]);

  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => query,
    [
      (globalFilters.retailers || []).join(','),
      (globalFilters.settlements || []).join(','),
      (globalFilters.municipalities || []).join(','),
      (globalFilters.categories || []).join(','),
      globalFilters.datePreset || "last7days",
    ],
    'discount-chart'
  );

  const data = useMemo(() => {
    return processDiscountData(resultSet);
  }, [resultSet]);

  return (
    <ChartWrapper
      title="Discount Rates by Retailer"
      description="See which retailers offer the best discounts"
      isLoading={isLoading}
      error={error}
      progress={progress}
      chartType="bar"
      data={data}
      chartConfigType="category"
      xAxisKey="retailer"
      dataKeys={['discount']}
      yAxisFormatter={(value) => `${value.toFixed(1)}%`}
      height="large"
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    />
  );
}