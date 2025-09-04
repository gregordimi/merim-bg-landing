import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

// --- TYPE DEFINITIONS ---
// For simple charts (line, pie, single-bar)
interface SimpleChartData {
  name: string;
  value: number;
  [key: string]: any;
}

// For the new grouped bar chart data structure
interface GroupedChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string;
}

interface GroupedChartData {
  labels: string[];
  datasets: GroupedChartDataset[];
}

// --- COMPONENT PROPS ---
interface ChartProps {
  type: 'bar' | 'grouped-bar' | 'line' | 'pie'; // 1. Added 'grouped-bar' type
  data: SimpleChartData[] | GroupedChartData;
  title?: string;
  xAxisKey?: string;
  yAxisKey?: string; // For simple charts
  color?: string;
  colors?: string[];
  height?: number;
  width?: number;
}

const defaultColors = [
  '#003f5c', '#58508d', '#bc5090', '#ff6361', '#ffa600',
  '#7A5195', '#EF5675', '#d084d0', '#87ceeb', '#98fb98'
];

const Chart: React.FC<ChartProps> = ({
  type,
  data,
  title,
  xAxisKey = 'name',
  yAxisKey = 'value',
  color = '#8884d8',
  colors = defaultColors,
  height = 300,
  width
}) => {
  const containerStyle = {
    width: width || '100%',
    height,
    marginBottom: '1rem'
  };

  const renderChart = () => {
    switch (type) {
      // 2. 'bar' case is now ONLY for single-series charts
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data as SimpleChartData[]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={yAxisKey} fill={color} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      // 3. New 'grouped-bar' case for handling grouped data
      case 'grouped-bar': { // Using block scope for constants
        const groupedData = data as GroupedChartData;

        // Data validation
        if (!groupedData.datasets || !groupedData.labels) {
            return <div>Invalid data format for a grouped bar chart.</div>;
        }
        
        // Transform data into the format Recharts expects
        const processedData = useMemo(() => {
          return groupedData.labels.map((label, index) => {
            const dataPoint: { [key: string]: any } = {
              [xAxisKey]: label,
            };
            groupedData.datasets.forEach(dataset => {
              dataPoint[dataset.label] = dataset.data[index];
            });
            return dataPoint;
          });
        }, [groupedData, xAxisKey]);

        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              {groupedData.datasets.map((dataset, index) => (
                <Bar
                  key={dataset.label}
                  dataKey={dataset.label}
                  fill={dataset.backgroundColor || colors[index % colors.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      }
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data as SimpleChartData[]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxisKey} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey={yAxisKey} stroke={color} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data as SimpleChartData[]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={yAxisKey}
              >
                {(data as SimpleChartData[]).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className="my-6 p-4 border rounded-lg bg-card">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-center text-foreground">{title}</h3>
      )}
      <div style={containerStyle}>
        {renderChart()}
      </div>
    </div>
  );
};

export default Chart;