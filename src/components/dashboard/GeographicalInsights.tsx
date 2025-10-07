/**
 * Geographical Insights Tab
 *
 * A geospatial view to uncover regional pricing patterns
 */

import { GlobalFilters } from "@/pages/DashboardPage";
import { RegionalTrendChart } from "@/components/charts/RegionalTrendChart";
import { SettlementChart } from "@/components/charts/SettlementChart";
import { MunicipalityChart } from "@/components/charts/MunicipalityChart";

interface GeographicalInsightsProps {
  globalFilters: GlobalFilters;
}

export default function GeographicalInsights({ globalFilters }: GeographicalInsightsProps) {
  return (
    <div className="space-y-6">
      <RegionalTrendChart globalFilters={globalFilters} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SettlementChart globalFilters={globalFilters} />
        <MunicipalityChart globalFilters={globalFilters} />
      </div>
    </div>
  );
}
