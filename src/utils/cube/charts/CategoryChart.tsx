import { ChartViewer } from '../ChartViewer.tsx';
import { QueryRenderer } from '../QueryRenderer.tsx';
import { ChartType } from '../types';

interface CategoryChartProps {
  apiUrl: string;
  apiToken: string;
  chartType: ChartType;
}

export function CategoryChart({ apiUrl, apiToken, chartType }: CategoryChartProps) {
  const categoryConfig = {
    query: {
      dimensions: ['category_groups.name'],
      filters: [
        { values: ['0'], member: 'prices.averageRetailPrice', operator: 'notEquals' }
      ],
      timeDimensions: [
        { dimension: 'prices.price_date', granularity: 'day' }
      ],
      measures: ['prices.averageRetailPrice']
    },
    pivotConfig: {
      x: ['prices.price_date.day'],
      y: ['category_groups.name', 'measures'],
      fillMissingDates: false
    }
  };

  return (
    <div className="space-y-4">
      <QueryRenderer query={categoryConfig.query} subscribe={false}>
        {({ resultSet }) => (
          <ChartViewer
            chartType={chartType}
            resultSet={resultSet}
            pivotConfig={categoryConfig.pivotConfig}
          />
        )}
      </QueryRenderer>
    </div>
  );
}