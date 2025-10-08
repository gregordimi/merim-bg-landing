/**
 * Simple Trend Chart
 * 
 * A simplified version that doesn't include filtered dimensions in the query,
 * which should provide cleaner trend lines when filters are applied.
 */

import { useMemo, useState, useEffect } from 'react';
import { GlobalFilters, buildFilters, buildTimeDimensions } from '@/utils/cube/filterUtils';
import { useStableQuery } from '@/hooks/useStableQuery';
import { ChartWrapper } from './ChartWrapper';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SimpleTrendChartProps {
  globalFilters: GlobalFilters;
}

interface ChartDataPoint {
  date: string;
  retailPrice: number;
  promoPrice: number;
}

export function SimpleTrendChart({ globalFilters }: SimpleTrendChartProps) {
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // Build a simple query without filtered dimensions
  const query = useMemo(() => ({
    measures: ["prices.averageRetailPrice", "prices.averagePromoPrice"],
    timeDimensions: buildTimeDimensions(globalFilters.dateRange),
    filters: buildFilters(globalFilters),
    order: { "prices.price_date": "asc" as const },
  }), [globalFilters]);

  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => query,
    [
      (globalFilters.retailers || []).join(','),
      (globalFilters.settlements || []).join(','),
      (globalFilters.municipalities || []).join(','),
      (globalFilters.categories || []).join(','),
      (globalFilters.dateRange || []).join(',')
    ],
    'simple-trend-chart'
  );

  // Keep track of the last valid data to prevent showing empty charts
  const [lastValidData, setLastValidData] = useState<ChartDataPoint[]>([]);
  const [hasEverLoaded, setHasEverLoaded] = useState(false);

  const chartData = useMemo(() => {
    if (!resultSet) return null;
    
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return null;

    return pivot.map((row: any) => ({
      date: row["prices.price_date.day"] || row["prices.price_date"],
      retailPrice: Number(row["prices.averageRetailPrice"] || 0),
      promoPrice: Number(row["prices.averagePromoPrice"] || 0),
    }));
  }, [resultSet]);

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
        day: "numeric" 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      <ChartWrapper
        title="Simple Price Trends Over Time"
        description="Clean trend lines without dimension grouping - shows overall averages for filtered data"
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
            {showDebugInfo ? 'Hide' : 'Show'} Debug Info
          </Button>
          {displayData && (
            <Badge variant="secondary">
              {displayData.length} data points
            </Badge>
          )}
          <Badge variant="outline">
            No dimensions - clean aggregation
          </Badge>
        </div>

        {displayData && displayData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDate} />
              <YAxis tickFormatter={(value) => `${value.toFixed(2)} лв`} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${Number(value).toFixed(2)} лв`,
                  name === "retailPrice" ? "Retail Price" : "Promo Price"
                ]}
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
            <CardTitle>Debug Information - Simple Trend Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Query Information */}
              <div>
                <h4 className="font-semibold mb-2">Query (No Dimensions):</h4>
                <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(query, null, 2)}
                </pre>
                <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                  <strong>Note:</strong> This query has no dimensions, so it aggregates all filtered data into single values per time period.
                  This should produce clean trend lines without the complexity of multiple dimension groupings.
                </div>
              </div>

              {/* Raw Data Preview */}
              {resultSet && (
                <div>
                  <h4 className="font-semibold mb-2">Raw Data (first 10 rows):</h4>
                  <div className="bg-muted p-3 rounded text-sm overflow-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          {resultSet.tableColumns().map((column: any) => (
                            <th key={column.key} className="text-left p-1 font-semibold">
                              {column.title}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {resultSet.tablePivot().slice(0, 10).map((row: any, index: number) => (
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
                  <h4 className="font-semibold mb-2">Processed Chart Data (first 10 points):</h4>
                  <div className="bg-muted p-3 rounded text-sm overflow-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-1 font-semibold">Date</th>
                          <th className="text-left p-1 font-semibold">Retail Price</th>
                          <th className="text-left p-1 font-semibold">Promo Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayData.slice(0, 10).map((point, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-1">{point.date}</td>
                            <td className="p-1">{point.retailPrice.toFixed(2)} лв</td>
                            <td className="p-1">{point.promoPrice.toFixed(2)} лв</td>
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
                    Retailers: {globalFilters.retailers.length || 'All'} 
                    {globalFilters.retailers.length > 0 && ` (${globalFilters.retailers.join(', ')})`}
                  </Badge>
                  <Badge variant="outline">
                    Settlements: {globalFilters.settlements.length || 'All'}
                    {globalFilters.settlements.length > 0 && ` (${globalFilters.settlements.join(', ')})`}
                  </Badge>
                  <Badge variant="outline">
                    Municipalities: {globalFilters.municipalities.length || 'All'}
                    {globalFilters.municipalities.length > 0 && ` (${globalFilters.municipalities.join(', ')})`}
                  </Badge>
                  <Badge variant="outline">
                    Categories: {globalFilters.categories.length || 'All'}
                    {globalFilters.categories.length > 0 && ` (${globalFilters.categories.join(', ')})`}
                  </Badge>
                  <Badge variant="outline">
                    Date: {globalFilters.dateRange ? globalFilters.dateRange.join(' to ') : 'Last 30 days'}
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