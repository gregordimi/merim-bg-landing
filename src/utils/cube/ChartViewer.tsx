import 'chart.js/auto';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { PivotConfig, ResultSet, Series } from '@cubejs-client/core';
import { type ChartType } from './types';

interface ChartViewerProps {
  resultSet: ResultSet;
  pivotConfig: PivotConfig;
  chartType: ChartType;
  selectedRetailer?: string;
}
export function ChartViewer(props: ChartViewerProps) {
  const { resultSet, pivotConfig, chartType, selectedRetailer } = props;

  // Get chart data
  const chartPivot = resultSet.chartPivot(pivotConfig) as Record<string, unknown>[];
  const series = resultSet.series(pivotConfig) as Series<Record<string, unknown>>[];

  let data;
  if (selectedRetailer) {
    // Find keys for the selected retailer
    const retailerKey = (row: Record<string, unknown>) => {
      const keys = Object.keys(row);
      return keys.find(k => k.startsWith(selectedRetailer + ',prices.averageRetailPrice'));
    };
    data = {
      labels: chartPivot.map((row: Record<string, unknown>) => row.x as string),
      datasets: [{
        fill: chartType === 'area',
        label: selectedRetailer,
        data: chartPivot.map((row: Record<string, unknown>) => {
          const key = retailerKey(row);
          if (!key || row[key] === 0 || row[key] === '0' || row[key] === undefined || row[key] === null) {
            return null;
          }
          return Number(row[key]);
        })
      }]
    };
  } else {
    data = {
      labels: chartPivot.map((row: Record<string, unknown>) => row.x as string),
      datasets: series.map((item: Series<Record<string, unknown>>) => {
        return {
          fill: chartType === 'area',
          label: item.title,
          data: item.series.map((point: Record<string, unknown>) => {
            if (point.value === 0 || point.value === '0' || point.value === undefined || point.value === null) {
              return null;
            }
            return Number(point.value);
          })
        };
      }),
    };
  }

  const ChartElement = {
    area: Line,
    bar: Bar,
    doughnut: Doughnut,
    line: Line,
    pie: Pie
  }[chartType as Exclude<ChartType, 'table'>];

  const options = {
  scales: {
    x: {
      type: 'time', // if your x labels are dates
      time: {
        unit: 'day',
        displayFormats: {
          day: 'MMM d'
        }
      },
      title: { display: true, text: 'Date' }
    }
  }
};

  return <ChartElement data={data}  />;
}
