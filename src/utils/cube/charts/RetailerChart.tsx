import { ChartViewer } from '../ChartViewer.tsx';
import { QueryRenderer } from '../QueryRenderer.tsx';
import { ChartType } from '../types';
import { useState, useEffect } from 'react';

interface RetailerChartProps {
  apiUrl: string;
  apiToken: string;
  chartType: ChartType;
}

export function RetailerChart({ apiUrl, apiToken, chartType }: RetailerChartProps) {
  const [retailerList, setRetailerList] = useState<string[]>([]);
  const [selectedRetailer, setSelectedRetailer] = useState<string>('');

  // Fetch retailer names from Cube API
  useEffect(() => {
    const fetchRetailers = async () => {
      try {
        const response = await fetch(`${apiUrl}/load`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: apiToken
          },
          body: JSON.stringify({
            query: {
              dimensions: ['retailers.name'],
              filters: [],
              timeDimensions: [],
              measures: []
            }
          })
        });
        const data = await response.json();
        const names: string[] = Array.from(new Set((data?.data || []).map((row: { [key: string]: string }) => row['retailers.name']).filter(Boolean)));
        setRetailerList(names);
      } catch (e) {
        setRetailerList([]);
      }
    };
    fetchRetailers();
  }, [apiUrl, apiToken]);

  const retailerConfig = {
    query: {
      dimensions: ['retailers.name', 'prices.price_date.day'],
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
      y: ['retailers.name', 'measures'],
      fillMissingDates: false
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <select
          className='px-2 py-1 border rounded'
          value={selectedRetailer}
          onChange={e => setSelectedRetailer(e.target.value)}
        >
          <option value=''>All Retailers</option>
          {retailerList.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>
      <QueryRenderer query={retailerConfig.query} subscribe={false}>
        {({ resultSet }) => (
          <ChartViewer
            chartType={chartType}
            resultSet={resultSet}
            pivotConfig={retailerConfig.pivotConfig}
            selectedRetailer={selectedRetailer}
          />
        )}
      </QueryRenderer>
    </div>
  );
}