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
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
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
    if (!value || value === 0) return "0";
    if (currency === "%") {
      return `${value.toFixed(1)}%`;
    }
    if (value < 1) return value.toFixed(2);
    return `${value.toFixed(2)} ${currency}`;
  };

  if (isLoading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg border border-border/50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-muted-foreground text-sm font-medium">Loading chart data...</div>
        </div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/5 rounded-lg border-2 border-dashed border-border/50">
        <div className="text-center p-6">
          <div className="text-5xl mb-3 opacity-20">📊</div>
          <p className="font-semibold text-foreground/80">{title}</p>
          {description && <p className="text-sm text-muted-foreground mt-1 mb-3">{description}</p>}
          <p className="text-muted-foreground font-medium">No data available</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  const ChartComponent = type === "bar" ? BarChart : LineChart;
  const DataComponent = type === "bar" ? Bar : Line;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <ChartComponent 
          data={chartData} 
          margin={{ top: 15, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey={xKey}
            tickFormatter={formatX}
            tick={{ fill: "hsl(var(--foreground))", fontSize: 11, fontWeight: 500 }}
            stroke="hsl(var(--border))"
            tickLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis 
            tickFormatter={formatY || defaultFormatY}
            tick={{ fill: "hsl(var(--foreground))", fontSize: 11, fontWeight: 500 }}
            stroke="hsl(var(--border))"
            tickLine={{ stroke: "hsl(var(--border))" }}
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
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              padding: "12px",
            }}
            labelStyle={{
              fontWeight: 600,
              color: "hsl(var(--foreground))",
              marginBottom: "4px",
            }}
            itemStyle={{
              padding: "4px 0",
              fontSize: "13px",
            }}
          />
          <Legend 
            wrapperStyle={{ 
              paddingTop: "24px",
              fontSize: "13px",
              fontWeight: 500,
            }}
            iconType="circle"
          />
          {yKeys.map((key, index) => (
            type === "bar" ? (
              <Bar
                key={key}
                dataKey={key}
                fill={COLORS[index % COLORS.length]}
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              />
            ) : (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
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
