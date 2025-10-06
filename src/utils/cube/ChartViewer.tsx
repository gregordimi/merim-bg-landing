import 'chart.js/auto';
import { memo, useMemo } from 'react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { PivotConfig, ResultSet, Series } from '@cubejs-client/core';
import { type ChartType } from './types';

interface ChartViewerProps {
  resultSet: ResultSet;
  pivotConfig: PivotConfig;
  chartType: ChartType;
  selectedRetailer?: string;
}

export const ChartViewer = memo(function ChartViewer(props: ChartViewerProps) {
  const { resultSet, pivotConfig, chartType, selectedRetailer } = props;

  const chartData = useMemo(() => {
    const chartPivot = resultSet.chartPivot(pivotConfig) as Record<string, unknown>[];
    const series = resultSet.series(pivotConfig) as Series<Record<string, unknown>>[];

    if (selectedRetailer) {
      const retailerKey = (row: Record<string, unknown>) => {
        const keys = Object.keys(row);
        return keys.find(k => k.startsWith(selectedRetailer + ',prices.averageRetailPrice'));
      };
      
      return {
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
    }

    return {
      labels: chartPivot.map((row: Record<string, unknown>) => row.x as string),
      datasets: series.map((item: Series<Record<string, unknown>>) => ({
        fill: chartType === 'area',
        label: item.title,
        data: item.series.map((point: Record<string, unknown>) => {
          if (point.value === 0 || point.value === '0' || point.value === undefined || point.value === null) {
            return null;
          }
          return Number(point.value);
        })
      }))
    };
  }, [resultSet, pivotConfig, chartType, selectedRetailer]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const,
          displayFormats: {
            day: 'MMM d'
          }
        },
        title: { display: true, text: 'Date' }
      }
    }
  }), []);

  const ChartElement = useMemo(() => ({
    area: Line,
    bar: Bar,
    doughnut: Doughnut,
    line: Line,
    pie: Pie
  }[chartType as Exclude<ChartType, 'table'>]), [chartType]);

  return <ChartElement data={chartData} options={chartOptions} />;
});
