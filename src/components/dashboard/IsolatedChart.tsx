/**
 * Isolated Chart Component
 * 
 * Each chart instance is completely isolated to prevent state interference.
 * Handles its own loading, error states, and data transformation.
 */

import { memo, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ResultSet } from "@cubejs-client/core";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
  "#a28ee0",
  "#f06292",
];

interface IsolatedChartProps {
  resultSet: ResultSet | null;
  isLoading: boolean;
  type: "line" | "bar";
  title: string;
  description?: string;
  currency?: string;
  xAxisKey?: string;
  yAxisKeys?: string[];
  formatX?: (value: any) => string;
  formatY?: (value: number) => string;
}

const IsolatedChart = memo(function IsolatedChart({
  resultSet,
  isLoading,
  type,
  title,
  description,
  currency = "лв",
  xAxisKey,
  yAxisKeys,
  formatX,
  formatY,
}: IsolatedChartProps) {
  const chartData = useMemo(() => {
    if (!resultSet) return null;

    try {
      const pivot = resultSet.tablePivot();
      if (!pivot || pivot.length === 0) return null;

      // Transform data for charting
      return pivot.map((row: any) => {
        const transformed: any = {};
        Object.keys(row).forEach((key) => {
          const value = row[key];
          // Convert numeric values
          if (typeof value === "string" && !isNaN(parseFloat(value))) {
            transformed[key] = parseFloat(value);
          } else {
            transformed[key] = value;
          }
        });
        return transformed;
      });
    } catch (error) {
      console.error("Chart data transformation error:", error);
      return null;
    }
  }, [resultSet]);

  const { xKey, yKeys } = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return { xKey: "", yKeys: [] };
    }

    const firstRow = chartData[0];
    const keys = Object.keys(firstRow);

    // Auto-detect keys if not provided
    const detectedXKey = xAxisKey || keys.find(k => 
      k.includes("date") || k.includes("name") || k.includes("category") || k.includes("retailer")
    ) || keys[0];

    const detectedYKeys = yAxisKeys || keys.filter(k => 
      k !== detectedXKey && (typeof firstRow[k] === "number")
    );

    return { xKey: detectedXKey, yKeys: detectedYKeys };
  }, [chartData, xAxisKey, yAxisKeys]);

  const defaultFormatY = (value: number) => {
    if (value === 0) return "0";
    if (value < 1) return value.toFixed(2);
    return value.toFixed(2) + " " + currency;
  };

  if (isLoading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-muted/20 rounded-lg animate-pulse">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-muted/10 rounded-lg border border-dashed">
        <div className="text-muted-foreground text-center p-4">
          <p className="font-medium">{title}</p>
          {description && <p className="text-sm mt-1">{description}</p>}
          <p className="mt-2">No data available</p>
        </div>
      </div>
    );
  }

  const ChartComponent = type === "bar" ? BarChart : LineChart;
  const DataComponent = type === "bar" ? Bar : Line;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <ChartComponent data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey={xKey}
            tickFormatter={formatX}
            tick={{ fill: "currentColor", fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={formatY || defaultFormatY}
            tick={{ fill: "currentColor", fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: any, name: string) => {
              if (typeof value === "number") {
                return [(formatY || defaultFormatY)(value), name];
              }
              return [value, name];
            }}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: "20px" }}
          />
          {yKeys.map((key, index) => (
            type === "bar" ? (
              <Bar
                key={key}
                dataKey={key}
                fill={COLORS[index % COLORS.length]}
                radius={[4, 4, 0, 0]}
              />
            ) : (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            )
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
});

export default IsolatedChart;
