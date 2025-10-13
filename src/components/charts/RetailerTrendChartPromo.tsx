import { RetailerTrendChart } from "./RetailerTrendChart";
import { GlobalFilters } from "@/utils/cube/filterUtils";

interface RetailerTrendChartPromoProps {
  globalFilters: GlobalFilters;
}

export function RetailerTrendChartPromo({ globalFilters }: RetailerTrendChartPromoProps) {
  return <RetailerTrendChart globalFilters={globalFilters} metricType="promo" />;
}