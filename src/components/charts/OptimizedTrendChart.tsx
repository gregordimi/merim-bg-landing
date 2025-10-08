/**
 * Optimized Trend Chart - Uses pre-aggregation matching queries
 */

import { useMemo } from "react";
import { useCubeQuery } from "@cubejs-client/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { GlobalFilters, buildOptimizedQuery } from "@/utils/cube/filterUtils";

interface OptimizedTrendChartProps {
  globalFilters: GlobalFilters;
}

export function OptimizedTrendChart({
  globalFilters,
}: OptimizedTrendChartProps) {
  // Build optimized query that matches pre-aggregations
  const query = useMemo(
    () =>
      buildOptimizedQuery(
        ["prices.averageRetailPrice", "prices.averagePromoPrice"],
        globalFilters
      ),
    [globalFilters]
  );

  const { resultSet, isLoading, error } = useCubeQuery(query);

  const chartData = useMemo(() => {
    if (!resultSet) return [];

    const pivot = resultSet.tablePivot();
    const dataMap = new Map();

    pivot.forEach((row: any) => {
      const date = row["prices.price_date.day"] || row["prices.price_date"];
      const retailPrice = Number(row["prices.averageRetailPrice"] || 0);
      const promoPrice = Number(row["prices.averagePromoPrice"] || 0);

      if (!dataMap.has(date)) {
        dataMap.set(date, {
          date,
          retailPrice: 0,
          promoPrice: 0,
          count: 0,
        });
      }

      const existing = dataMap.get(date);
      existing.retailPrice += retailPrice;
      existing.promoPrice += promoPrice;
      existing.count += 1;
    });

    return Array.from(dataMap.values())
      .map((item) => ({
        date: item.date,
        retailPrice: item.count > 0 ? item.retailPrice / item.count : 0,
        promoPrice: item.count > 0 ? item.promoPrice / item.count : 0,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [resultSet]);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">
            Error loading trend data: {error.toString()}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>📈 Price Trends (Optimized)</CardTitle>
        <div className="text-sm text-muted-foreground">
          Retail and promotional price trends over time - uses pre-aggregations
          for fast performance
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-muted-foreground">Loading trend data...</div>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("bg-BG", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("bg-BG")
                  }
                  formatter={(value: number) => [`${value.toFixed(2)} лв`, ""]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="retailPrice"
                  stroke="#2563eb"
                  strokeWidth={2}
                  name="Retail Price"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="promoPrice"
                  stroke="#dc2626"
                  strokeWidth={2}
                  name="Promo Price"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
