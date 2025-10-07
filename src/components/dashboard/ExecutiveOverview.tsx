/**
 * Executive Overview Tab
 *
 * High-level summary of key performance indicators and market trends
 */

import { GlobalFilters } from "@/pages/DashboardPage";
import { StatsCards } from "@/components/charts/StatsCards";
import { TrendChart } from "@/components/charts/TrendChart";
import { CategoryChart } from "@/components/charts/CategoryChart";

interface ExecutiveOverviewProps {
  globalFilters: GlobalFilters;
}

export default function ExecutiveOverview({ globalFilters }: ExecutiveOverviewProps) {
  return (
    <div className="space-y-6">
      <StatsCards globalFilters={globalFilters} />
      <TrendChart globalFilters={globalFilters} />
      <CategoryChart globalFilters={globalFilters} />
    </div>
  );
}
