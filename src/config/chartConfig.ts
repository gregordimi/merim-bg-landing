/**
 * Chart Configuration
 * Centralized theming and styling configuration for all charts
 */

import { ChartConfig } from "@/components/ui/chart";

// Extended color palette
export const CHART_COLORS = [
  "#0088FE", // Blue
  "#00C49F", // Teal
  "#FFBB28", // Yellow
  "#FF8042", // Orange
  "#8884d8", // Purple
  "#82ca9d", // Green
  "#ffc658", // Gold
  "#ff7c7c", // Red
  "#a4de6c", // Light Green
  "#d0ed57", // Lime
  "#8dd1e1", // Sky Blue
  "#83a6ed", // Lavender
  "#8e4585", // Plum
  "#f48fb1", // Pink
  "#ffab91", // Peach
];

// Chart type configurations
export const getChartConfig = (
  type: "trend" | "category" | "comparison" | "distribution"
): ChartConfig => {
  switch (type) {
    case "trend":
      return {
        retailPrice: {
          label: "Retail Price",
          color: CHART_COLORS[0],
        },
        promoPrice: {
          label: "Promo Price",
          color: CHART_COLORS[1],
        },
        discountPercent: {
          label: "Discount %",
          color: CHART_COLORS[3],
        },
      } satisfies ChartConfig;

    case "category":
      return {
        retailPrice: {
          label: "Retail Price",
          color: CHART_COLORS[0],
        },
        promoPrice: {
          label: "Promo Price",
          color: CHART_COLORS[1],
        },
        ...Object.fromEntries(
          Array.from({ length: 8 }, (_, i) => [
            `category${i}`,
            {
              label: `Category ${i + 1}`,
              color: CHART_COLORS[(i + 2) % CHART_COLORS.length],
            },
          ])
        )
      } as ChartConfig;

    case "comparison":
      return {
        value1: {
          label: "Value 1",
          color: CHART_COLORS[0],
        },
        value2: {
          label: "Value 2",
          color: CHART_COLORS[2],
        },
        value3: {
          label: "Value 3",
          color: CHART_COLORS[4],
        },
      } satisfies ChartConfig;

    case "distribution":
      return Object.fromEntries(
        CHART_COLORS.map((color, i) => [
          `segment${i}`,
          {
            label: `Segment ${i + 1}`,
            color,
          },
        ])
      ) as ChartConfig;

    default:
      return {} as ChartConfig;
  }
};

// Common chart margins
export const CHART_MARGINS = {
  default: {
    top: 10,
    right: 10,
    left: 10,
    bottom: 0,
  },
  withLegend: {
    top: 10,
    right: 30,
    left: 10,
    bottom: 5,
  },
};

// Chart height presets
export const CHART_HEIGHTS = {
  small: 250,
  medium: 350,
  large: 450,
  xl: 550,
};

/**
 * Get color by index from the palette
 */
export const getColorByIndex = (index: number): string => {
  return CHART_COLORS[index % CHART_COLORS.length];
};

/**
 * Generate gradient definitions for area charts
 */
export const generateGradientDefs = (id: string, color: string) => ({
  id,
  x1: "0",
  y1: "0",
  x2: "0",
  y2: "1",
  stops: [
    {
      offset: "5%",
      stopColor: color,
      stopOpacity: 0.8,
    },
    {
      offset: "95%",
      stopColor: color,
      stopOpacity: 0.1,
    },
  ],
});
