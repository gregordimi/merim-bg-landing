import { RetailerTrendChart } from "./RetailerTrendChart";
import { GlobalFilters } from "@/utils/cube/filterUtils";

interface RetailerTrendChartPriceProps {
  globalFilters: GlobalFilters;
}

export function RetailerTrendChartPrice({ globalFilters }: RetailerTrendChartPriceProps) {
  return <RetailerTrendChart globalFilters={globalFilters} metricType="price" />;
}