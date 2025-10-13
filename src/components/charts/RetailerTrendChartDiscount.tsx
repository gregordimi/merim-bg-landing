import { RetailerTrendChart } from "./RetailerTrendChart";
import { GlobalFilters } from "@/utils/cube/filterUtils";

interface RetailerTrendChartDiscountProps {
  globalFilters: GlobalFilters;
}

export function RetailerTrendChartDiscount({ globalFilters }: RetailerTrendChartDiscountProps) {
  return <RetailerTrendChart globalFilters={globalFilters} metricType="discount" />;
}