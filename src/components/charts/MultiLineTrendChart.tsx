/**
 * Multi-Line Trend Chart
 * 
 * Shows separate lines for each dimension value (e.g., one line per retailer)
 * instead of aggregating them into a single average line.
 */

import { useMemo, useState, useEffect } from 'react';
import { GlobalFilters, buildOptimizedQuery } from '@/utils/cube/filterUtils';
import { useStableQuery } from '@/hooks/useStableQuery';
import { ChartWrapper } from './ChartWrapper';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MultiLineTrendChartProps {
  globalFilters: GlobalFilters;
}

interface ChartDataPoint {
  date: string;
  [key: string]: any; // Dynamic keys for each dimension value
}

export function MultiLineTrendChart({ globalFilters }: MultiLineTrendChartProps) {
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [selectedMeasure, setSelectedMeasure] = useState<'retail' | 'promo'>('retail');
  
  // Build the query with dimensions
  const query = useMemo(() => buildOptimizedQuery(
    ["prices.averageRetailPrice", "prices.averagePromoPrice"],
    globalFilters
  ), [globalFilters]);

  const { resultSet, isLoading, error, progress } = useStableQuery(
    () => query,
    [
      (globalFilters.retailers || []).join(','),
      (globalFilters.settlements || []).join(','),
      (globalFilters.municipalities || []).join(','),
      (globalFilters.categories || []).join(','),
      globalFilters.datePreset || "last7days",
    ],
    'multi-line-trend-chart'
  );

  // Keep track of the last valid data to prevent showing empty charts
  const [lastValidData, setLastValidData] = useState<ChartDataPoint[]>([]);
  const [lastValidDimensionValues, setLastValidDimensionValues] = useState<string[]>([]);
  const [hasEverLoaded, setHasEverLoaded] = useState(false);

  const { chartData, dimensionValues, dimensionKey } = useMemo(() => {
    if (!resultSet) return { chartData: null, dimensionValues: null, dimensionKey: null };
    
    const pivot = resultSet.tablePivot();
    if (!pivot || pivot.length === 0) return { chartData: null, dimensionValues: null, dimensionKey: null };

    // Find the dimension column (first non-date, non-measure column)
    const columns = resultSet.tableColumns();
    const dimensionColumn = columns.find((col: any) => 
      !col.key.includes('price_date') && 
      !col.key.includes('averageRetailPrice') && 
      !col.key.includes('averagePromoPrice')
    );

    if (!dimensionColumn) {
      return { chartData: null, dimensionValues: null, dimensionKey: null };
    }

    const dimKey = dimensionColumn.key;
    
    // Group data by date and dimension value
    const dataMap = new Map();
    const dimValues = new Set();

    pivot.forEach((row: any) => {
      const date = row["prices.price_date.day"] || row["prices.price_date"];
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

    // Convert to array and sort by date
    const chartData = Array.from(dataMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      chartData,
      dimensionValues: Array.from(dimValues) as string[],
      dimensionKey: dimKey,
    };
  }, [resultSet]);

  // Update last valid data when we get new data
  useEffect(() => {
    if (chartData && chartData.length > 0 && dimensionValues && dimensionValues.length > 0 && !isLoading) {
      setLastValidData(chartData);
      setLastValidDimensionValues(dimensionValues);
      setHasEverLoaded(true);
    }
  }, [chartData, dimensionValues, isLoading]);

  // Determine what data to display
  const displayData = chartData || lastValidData;
  const displayDimensionValues = dimensionValues || lastValidDimensionValues;
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

  const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", 
    "#8884d8", "#82ca9d", "#ffc658", "#ff7c7c",
    "#8dd1e1", "#d084d0", "#ffb347", "#87ceeb"
  ];

  const measureSuffix = selectedMeasure === 'retail' ? '_retail' : '_promo';
  const measureLabel = selectedMeasure === 'retail' ? 'Retail Price' : 'Promo Price';

  return (
    <div className="space-y-4">
      <ChartWrapper
        title="Multi-Line Price Trends"
        description="Separate trend lines for each dimension value (retailer, settlement, etc.)"
        isLoading={shouldShowLoading}
        error={error}
        progress={progress}
      >
        <div className="mb-4 flex gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowDebugInfo(!showDebugInfo)}
          >
            {showDebugInfo ? 'Hide' : 'Show'} Debug Info
          </Button>
          
          <Button 
            variant={selectedMeasure === 'retail' ? 'default' : 'outline'}
            size="sm" 
            onClick={() => setSelectedMeasure('retail')}
          >
            Retail Prices
          </Button>
          
          <Button 
            variant={selectedMeasure === 'promo' ? 'default' : 'outline'}
            size="sm" 
            onClick={() => setSelectedMeasure('promo')}
          >
            Promo Prices
          </Button>

          {displayData && (
            <Badge variant="secondary">
              {displayData.length} data points
            </Badge>
          )}
          
          {displayDimensionValues && (
            <Badge variant="outline">
              {displayDimensionValues.length} lines ({dimensionKey?.replace('prices.', '').replace('_name', '')})
            </Badge>
          )}
        </div>

        {displayData && displayData.length > 0 && displayDimensionValues && displayDimensionValues.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDate} />
              <YAxis tickFormatter={(value) => `${value.toFixed(2)} лв`} />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${Number(value).toFixed(2)} лв`,
                  name.replace(measureSuffix, '')
                ]}
                labelFormatter={(date) => formatDate(date)}
                labelStyle={{ color: "#000" }}
              />
              <Legend />
              {displayDimensionValues.map((dimValue, index) => (
                <Line
                  key={`${dimValue}${measureSuffix}`}
                  type="monotone"
                  dataKey={`${dimValue}${measureSuffix}`}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name={dimValue}
                  connectNulls={false}
                />
              ))}
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
            <CardTitle>Debug Information - Multi-Line Trend Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Query Information */}
              <div>
                <h4 className="font-semibold mb-2">Query (With Dimensions):</h4>
                <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(query, null, 2)}
                </pre>
                <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                  <strong>Note:</strong> This query includes filtered dimensions, so you get separate rows for each dimension value.
                  Each dimension value gets its own line on the chart.
                </div>
              </div>

              {/* Dimension Information */}
              {dimensionKey && displayDimensionValues && (
                <div>
                  <h4 className="font-semibold mb-2">Detected Dimension: {dimensionKey}</h4>
                  <div className="flex flex-wrap gap-1">
                    {displayDimensionValues.map((value, index) => (
                      <Badge 
                        key={value} 
                        variant="outline"
                        style={{ borderColor: COLORS[index % COLORS.length] }}
                      >
                        {value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

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