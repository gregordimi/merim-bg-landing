import { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PivotConfig, ResultSet } from "@cubejs-client/core";
import { type ChartType } from "./types";

const formatDate = (dateStr: string, format?: Intl.DateTimeFormatOptions) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(
      "en-US",
      format || { month: "short", day: "numeric", year: "numeric" }
    );
  } catch {
    return dateStr;
  }
};

const formatValue = (value: number, decimals: number = 2) => {
  return Number(value.toFixed(decimals));
};

interface ChartViewerProps {
  resultSet: ResultSet;
  pivotConfig: PivotConfig;
  chartType: ChartType;
  selectedRetailers?: string[];
  chartId: string;
  decimals?: number;
  currency?: string;
  dateFormat?: Intl.DateTimeFormatOptions;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
];

export function ChartViewer(props: ChartViewerProps) {
  const {
    resultSet,
    chartType,
    selectedRetailers,
    decimals = 2,
    currency = "лв",
    dateFormat,
  } = props;

  const pivot = resultSet.tablePivot();

  let chartData: any[];
  let dataKeys: string[];

  if (selectedRetailers && selectedRetailers.length > 0) {
    const filtered = pivot.filter((row: any) =>
      selectedRetailers.includes(row["retailers.name"])
    );
    const grouped = filtered.reduce((acc: any, row: any) => {
      const date = row["prices.price_date.day"] || row["prices.price_date"] || row["prices.price_date.week"];
      if (!acc[date]) acc[date] = { date };
      const retailer = row["retailers.name"];
      const value = formatValue(
        parseFloat(row["prices.averageRetailPrice"]) || 0,
        decimals
      );
      acc[date][retailer] = value > 0 ? value : null;
      return acc;
    }, {});
    chartData = Object.values(grouped);
    dataKeys = selectedRetailers;
  } else {
    const allKeys = new Set<string>();
    const grouped = pivot.reduce((acc: any, row: any) => {
      const date = row["prices.price_date.day"] || row["prices.price_date"] || row["prices.price_date.week"];
      if (!acc[date]) acc[date] = { date };
      const name =
        row["retailers.name"] || 
        row["category_groups.name"] || 
        row["settlements.name_en"] ||
        row["settlements.municipality"] ||
        "value";
      const value = formatValue(
        parseFloat(row["prices.averageRetailPrice"]) || 0,
        decimals
      );
      if (name) allKeys.add(name);
      acc[date][name] = value > 0 ? value : null;
      return acc;
    }, {});
    chartData = Object.values(grouped);
    dataKeys = Array.from(allKeys).sort();
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="text-muted-foreground p-8 text-center">
        No data available
      </div>
    );
  }

  if (chartType === "pie" || chartType === "doughnut") {
    const pieData = dataKeys.map((key) => ({
      name: key,
      value: formatValue(
        chartData.reduce((sum: number, item: any) => sum + (item[key] || 0), 0),
        decimals
      ),
    }));

    return (
      <ResponsiveContainer width="100%" height={600}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={chartType === "doughnut" ? 60 : 0}
            outerRadius={80}
            label={(entry) => `${entry.name}: ${entry.value} ${currency}`}
          >
            {pieData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) =>
              `${formatValue(value, decimals)} ${currency}`
            }
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === "bar") {
    return (
      <ResponsiveContainer width="100%" height={600}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => formatDate(date, dateFormat)}
          />
          <YAxis
            tickFormatter={(value) =>
              `${formatValue(value, decimals)} ${currency}`
            }
          />
          <Tooltip />
          <Legend />
          {dataKeys.map((key, index) => (
            <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={600}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(date) => formatDate(date, dateFormat)}
        />
        <YAxis
          tickFormatter={(value) =>
            `${formatValue(value, decimals)} ${currency}`
          }
        />
        <Tooltip />
        <Legend />
        {dataKeys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={COLORS[index % COLORS.length]}
            fill={chartType === "area" ? COLORS[index % COLORS.length] : "none"}
            fillOpacity={chartType === "area" ? 0.3 : 0}
            connectNulls={true}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
