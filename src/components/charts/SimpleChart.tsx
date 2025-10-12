/**
 * Example of how simple chart creation is now with the enhanced ChartWrapper
 */

import { ChartWrapper } from "../../config/ChartWrapper";

// Sample data
const sampleData = [
  { date: "2024-01-01", retailPrice: 12.5, promoPrice: 10.2 },
  { date: "2024-01-02", retailPrice: 13.1, promoPrice: 11.0 },
  { date: "2024-01-03", retailPrice: 12.8, promoPrice: 10.5 },
  { date: "2024-01-04", retailPrice: 14.2, promoPrice: 12.1 },
  { date: "2024-01-05", retailPrice: 13.9, promoPrice: 11.8 },
];

const categoryData = [
  { category: "Electronics", retailPrice: 299.99, promoPrice: 249.99 },
  { category: "Clothing", retailPrice: 89.99, promoPrice: 69.99 },
  { category: "Food", retailPrice: 15.99, promoPrice: 12.99 },
  { category: "Books", retailPrice: 24.99, promoPrice: 19.99 },
];

// Ultra-simple chart creation - just pass data and a few props!
export function SimpleAreaChart() {
  return (
    <ChartWrapper
      title="Simple Area Chart"
      description="Created with just a few props!"
      isLoading={false}
      error={null}
      chartType="area"
      data={sampleData}
      chartConfigType="trend"
      xAxisKey="date"
      dataKeys={['retailPrice', 'promoPrice']}
    />
  );
}

export function SimpleBarChart() {
  return (
    <ChartWrapper
      title="Simple Bar Chart"
      description="Even simpler bar chart creation!"
      isLoading={false}
      error={null}
      chartType="bar"
      data={categoryData}
      chartConfigType="category"
      xAxisKey="category"
      dataKeys={['retailPrice', 'promoPrice']}
      height="large"
    />
  );
}

// Example with trend calculation
export function TrendAreaChart() {
  const trend = {
    value: "12.5",
    direction: "up" as const
  };

  return (
    <ChartWrapper
      title="Trend Area Chart"
      description="With automatic trend display"
      isLoading={false}
      error={null}
      trend={trend}
      chartType="area"
      data={sampleData}
      chartConfigType="trend"
      xAxisKey="date"
      dataKeys={['retailPrice', 'promoPrice']}
    />
  );
}