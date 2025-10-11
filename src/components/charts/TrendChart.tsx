import { useMemo, useState, useEffect } from "react";
import { GlobalFilters, buildOptimizedQuery } from "@/utils/cube/filterUtils";
import { useStableQuery } from "@/hooks/useStableQuery";
import { ChartWrapper } from "./ChartWrapper";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TrendChartProps {
  globalFilters: GlobalFilters;
}

interface ChartDataPoint {
  date: string;
  retailPrice: number;
  promoPrice: number;
  retailPriceCount: number;
  promoPriceCount: number;
}

export function TrendChart({ globalFilters }: TrendChartProps) {
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Build the query
  const query = useMemo(() => {
    console.log(
      "🔧 TrendChart building query with globalFilters:",
      globalFilters
    );
    return buildOptimizedQuery(
      ["prices.averageRetailPrice", "prices.averagePromoPrice"],
      globalFilters
    );
  }, [globalFilters]);

  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => query,
    [
      globalFilters.retailers?.join(",") ?? "",
      globalFilters.settlements?.join(",") ?? "",
      globalFilters.municipalities?.join(",") ?? "",
      globalFilters.categories?.join(",") ?? "",
      globalFilters.datePreset ?? "last7days",
      globalFilters.granularity ?? "day",
    ],
    "trend-chart"
  );

  // Keep track of the last valid data to prevent showing empty charts
  const [lastValidData, setLastValidData] = useState<ChartDataPoint[]>([]);
  const [hasEverLoaded, setHasEverLoaded] = useState(false);

  const chartData = useMemo(() => {
    if (!resultSet) return null;

    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return null;

    // Group by date and aggregate multiple dimension values
    const dataMap = new Map();

    pivot.forEach((row: any) => {
      const granularity = globalFilters.granularity ?? "day";
      const dateKey = `prices.price_date.${granularity}`;
      const date = row[dateKey] || row["prices.price_date"];
      const retailPrice = Number(row["prices.averageRetailPrice"] || 0);
      const promoPrice = Number(row["prices.averagePromoPrice"] || 0);

      if (!dataMap.has(date)) {
        dataMap.set(date, {
          date,
          retailPrices: [],
          promoPrices: [],
        });
      }

      const dateEntry = dataMap.get(date);
      if (retailPrice > 0) dateEntry.retailPrices.push(retailPrice);
      if (promoPrice > 0) dateEntry.promoPrices.push(promoPrice);
    });

    // Calculate averages for each date
    return Array.from(dataMap.values())
      .map((entry) => ({
        date: entry.date,
        retailPrice:
          entry.retailPrices.length > 0
            ? entry.retailPrices.reduce(
                (sum: number, price: number) => sum + price,
                0
              ) / entry.retailPrices.length
            : 0,
        promoPrice:
          entry.promoPrices.length > 0
            ? entry.promoPrices.reduce(
                (sum: number, price: number) => sum + price,
                0
              ) / entry.promoPrices.length
            : 0,
        retailPriceCount: entry.retailPrices.length,
        promoPriceCount: entry.promoPrices.length,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [resultSet, globalFilters.granularity]);

  // Update last valid data when we get new data
  useEffect(() => {
    if (chartData && chartData.length > 0 && !isLoading) {
      setLastValidData(chartData);
      setHasEverLoaded(true);
    }
  }, [chartData, isLoading]);

  // Determine what data to display
  const displayData = chartData || lastValidData;
  const shouldShowLoading = isLoading && !hasEverLoaded;

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

  return (
    <div className="space-y-4">
      <ChartWrapper
        title="Price Trends Over Time"
        description="Track retail and promotional price changes (aggregated when multiple dimension values exist per date)"
        isLoading={shouldShowLoading}
        error={error}
        progress={progress}
      >
        <div className="mb-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDebugInfo(!showDebugInfo)}
          >
            {showDebugInfo ? "Hide" : "Show"} Debug Info
          </Button>
          {displayData && (
            <Badge variant="secondary">{displayData.length} data points</Badge>
          )}
        </div>

        {displayData && displayData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={displayData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDate} />
              <YAxis tickFormatter={(value) => `${value.toFixed(2)} лв`} />
              <Tooltip
                formatter={(value: number, name: string, props: any) => {
                  const data = props.payload;
                  const label =
                    name === "retailPrice" ? "Retail Price" : "Promo Price";
                  const count =
                    name === "retailPrice"
                      ? data.retailPriceCount
                      : data.promoPriceCount;
                  return [
                    `${Number(value).toFixed(2)} лв (avg of ${count} values)`,
                    label,
                  ];
                }}
                labelFormatter={(date) => formatDate(date)}
                labelStyle={{ color: "#000" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="retailPrice"
                stroke="#0088FE"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Retail Price"
              />
              <Line
                type="monotone"
                dataKey="promoPrice"
                stroke="#00C49F"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Promo Price"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : !shouldShowLoading ? (
          <div className="w-full h-[400px] flex items-center justify-center text-muted-foreground">
            No data available for the selected filters
          </div>
        ) : null}
      </ChartWrapper>

      {/* Debug Information */}
      {showDebugInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Query Information */}
              <div>
                <h4 className="font-semibold mb-2">Query:</h4>
                <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(query, null, 2)}
                </pre>
              </div>

              {/* Raw Data Preview */}
              {resultSet && (
                <div>
                  <h4 className="font-semibold mb-2">
                    Raw Data (first 10 rows):
                  </h4>
                  <div className="bg-muted p-3 rounded text-sm overflow-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          {resultSet.tableColumns().map((column: any) => (
                            <th
                              key={column.key}
                              className="text-left p-1 font-semibold"
                            >
                              {column.title}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {resultSet
                          .tablePivot()
                          .slice(0, 10)
                          .map((row: any, index: number) => (
                            <tr key={index} className="border-b">
                              {resultSet.tableColumns().map((column: any) => (
                                <td key={column.key} className="p-1">
                                  {row[column.key]}
                                </td>
                              ))}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Processed Chart Data */}
              {displayData && (
                <div>
                  <h4 className="font-semibold mb-2">
                    Processed Chart Data (first 10 points):
                  </h4>
                  <div className="bg-muted p-3 rounded text-sm overflow-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-1 font-semibold">Date</th>
                          <th className="text-left p-1 font-semibold">
                            Retail Price
                          </th>
                          <th className="text-left p-1 font-semibold">
                            Promo Price
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayData.slice(0, 10).map((point, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-1">{point.date}</td>
                            <td className="p-1">
                              {point.retailPrice.toFixed(2)} лв (avg of{" "}
                              {point.retailPriceCount})
                            </td>
                            <td className="p-1">
                              {point.promoPrice.toFixed(2)} лв (avg of{" "}
                              {point.promoPriceCount})
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Filter Information */}
              <div>
                <h4 className="font-semibold mb-2">Active Filters:</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    Retailers:{" "}
                    {(globalFilters.retailers || []).length > 0
                      ? (globalFilters.retailers || []).length
                      : "All"}
                    {(globalFilters.retailers || []).length > 0 &&
                      ` (${(globalFilters.retailers || []).join(", ")})`}
                  </Badge>
                  <Badge variant="outline">
                    Settlements:{" "}
                    {(globalFilters.settlements || []).length > 0
                      ? (globalFilters.settlements || []).length
                      : "All"}
                    {(globalFilters.settlements || []).length > 0 &&
                      ` (${(globalFilters.settlements || []).join(", ")})`}
                  </Badge>
                  <Badge variant="outline">
                    Municipalities:{" "}
                    {(globalFilters.municipalities || []).length > 0
                      ? (globalFilters.municipalities || []).length
                      : "All"}
                    {(globalFilters.municipalities || []).length > 0 &&
                      ` (${(globalFilters.municipalities || []).join(", ")})`}
                  </Badge>
                  <Badge variant="outline">
                    Categories:{" "}
                    {(globalFilters.categories || []).length > 0
                      ? (globalFilters.categories || []).length
                      : "All"}
                    {(globalFilters.categories || []).length > 0 &&
                      ` (${(globalFilters.categories || []).join(", ")})`}
                  </Badge>
                  <Badge variant="outline">
                    Date: {globalFilters.datePreset ?? "last7days"}
                  </Badge>
                  <Badge variant="outline">
                    Granularity: {globalFilters.granularity ?? "day"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
