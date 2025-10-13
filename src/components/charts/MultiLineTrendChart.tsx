/**
 * Multi-Line Trend Chart
 *
 * Shows separate lines for each dimension value (e.g., one line per retailer)
 * instead of aggregating them into a single average line.
 */

import { useMemo, useState } from "react";
import { GlobalFilters, buildOptimizedQuery } from "@/utils/cube/filterUtils";
import { useStableQuery } from "@/hooks/useStableQuery";
import { ChartWrapper } from "../../config/ChartWrapper";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CHART_COLORS } from "@/config/chartConfig";

interface MultiLineTrendChartProps {
  globalFilters: GlobalFilters;
}

interface ChartDataPoint {
  date: string;
  [key: string]: any; // Dynamic keys for each dimension value
}

export function MultiLineTrendChart({
  globalFilters,
}: MultiLineTrendChartProps) {
  const [selectedMeasure, setSelectedMeasure] = useState<"retail" | "promo">(
    "retail"
  );

  // Build the query with dimensions
  const query = useMemo(
    () =>
      buildOptimizedQuery(
        ["prices.averageRetailPrice", "prices.averagePromoPrice"],
        globalFilters
      ),
    [globalFilters]
  );

  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => query,
    [
      (globalFilters.retailers || []).join(","),
      (globalFilters.settlements || []).join(","),
      (globalFilters.municipalities || []).join(","),
      (globalFilters.categories || []).join(","),
      globalFilters.datePreset ?? "last7days",
      globalFilters.granularity ?? "day",
    ],
    "multi-line-trend-chart"
  );

  const processedData = useMemo(() => {
    if (!resultSet)
      return { data: [], dimensionValues: [], dimensionKey: null };

    try {
      const pivot = resultSet.tablePivot();
      if (!pivot || pivot.length === 0)
        return { data: [], dimensionValues: [], dimensionKey: null };

      const columns = resultSet.tableColumns();
      const dimensionColumn = columns.find(
        (col: any) =>
          !col.key.includes("price_date") &&
          !col.key.includes("averageRetailPrice") &&
          !col.key.includes("averagePromoPrice")
      );

      if (!dimensionColumn) {
        return { data: [], dimensionValues: [], dimensionKey: null };
      }

      const dimKey = dimensionColumn.key;
      const dataMap = new Map();
      const dimValues = new Set();

      pivot.forEach((row: any) => {
        const granularity = globalFilters.granularity ?? "day";
        const dateKey = `prices.price_date.${granularity}`;
        const date = row[dateKey] || row["prices.price_date"];
        const dimensionValue = row[dimKey];
        const retailPrice = Number(row["prices.averageRetailPrice"] || 0);
        const promoPrice = Number(row["prices.averagePromoPrice"] || 0);

        if (!dataMap.has(date)) {
          dataMap.set(date, { date });
        }

        const dateEntry = dataMap.get(date);
        if (dimensionValue) {
          dimValues.add(dimensionValue);
          dateEntry[`${dimensionValue}_retail`] = retailPrice;
          dateEntry[`${dimensionValue}_promo`] = promoPrice;
        }
      });

      const data = Array.from(dataMap.values()).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      return {
        data,
        dimensionValues: Array.from(dimValues) as string[],
        dimensionKey: dimKey,
      };
    } catch (error) {
      console.error("Error processing multi-line data:", error);
      return { data: [], dimensionValues: [], dimensionKey: null };
    }
  }, [resultSet, globalFilters.granularity]);

  const { data: chartData, dimensionValues, dimensionKey } = processedData;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const measureSuffix = selectedMeasure === "retail" ? "_retail" : "_promo";

  return (
    <ChartWrapper
      title="Multi-Line Price Trends"
      description="Separate trend lines for each dimension value (retailer, settlement, etc.)"
      isLoading={isLoading}
      error={error}
      progress={progress}
      chartType="custom"
      query={query}
      resultSet={resultSet}
      globalFilters={globalFilters}
    >
      <div className="mb-4 flex gap-2 flex-wrap">
        <Button
          variant={selectedMeasure === "retail" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedMeasure("retail")}
        >
          Retail Prices
        </Button>

        <Button
          variant={selectedMeasure === "promo" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedMeasure("promo")}
        >
          Promo Prices
        </Button>

        {chartData && (
          <Badge variant="secondary">{chartData.length} data points</Badge>
        )}

        {dimensionValues && (
          <Badge variant="outline">
            {dimensionValues.length} lines (
            {dimensionKey?.replace("prices.", "").replace("_name", "")})
          </Badge>
        )}
      </div>

      {chartData &&
      chartData.length > 0 &&
      dimensionValues &&
      dimensionValues.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatDate} />
            <YAxis tickFormatter={(value) => `${value.toFixed(2)} лв`} />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${Number(value).toFixed(2)} лв`,
                name.replace(measureSuffix, ""),
              ]}
              labelFormatter={(date) => formatDate(date)}
              labelStyle={{ color: "#000" }}
            />
            <Legend />
            {dimensionValues.map((dimValue, index) => (
              <Line
                key={`${dimValue}${measureSuffix}`}
                type="monotone"
                dataKey={`${dimValue}${measureSuffix}`}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                name={dimValue}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="w-full h-[400px] flex items-center justify-center text-muted-foreground">
          No data available for the selected filters
        </div>
      )}
    </ChartWrapper>
  );
}
