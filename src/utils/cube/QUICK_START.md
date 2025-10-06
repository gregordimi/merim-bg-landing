# Quick Start Guide

## Add a New Chart in 60 Seconds

### Step 1: Open `chartConfigs.ts`

### Step 2: Add your config
```typescript
export const CHART_CONFIGS: Record<string, ChartConfig> = {
  retailer: { ... },
  category: { ... },
  
  // Add your new chart here:
  myNewChart: {
    id: 'myNewChart',
    title: 'My Awesome Chart',
    description: 'What this chart shows',
    query: {
      dimensions: ['your.dimension'],
      measures: ['your.measure'],
      timeDimensions: [
        { dimension: 'your.date', granularity: 'day' }
      ]
    },
    pivotConfig: {
      x: ['your.date.day'],
      y: ['your.dimension', 'measures'],
      fillMissingDates: false
    }
  }
};
```

### Step 3: Open `App.tsx` and add a tab
```typescript
// Update grid-cols-2 to grid-cols-3
<TabsList className="grid w-full grid-cols-3 mb-6">
  <TabsTrigger value="retailer">By Retailer</TabsTrigger>
  <TabsTrigger value="category">By Category</TabsTrigger>
  <TabsTrigger value="myNewChart">My Chart</TabsTrigger>
</TabsList>

// Add the tab content
<TabsContent value="myNewChart" className="space-y-6">
  <Chart config={CHART_CONFIGS.myNewChart} chartType={chartType} />
</TabsContent>
```

### Done! 🚀

## Common Patterns

### Multiple Charts in One Tab
```typescript
<TabsContent value="overview" className="space-y-6">
  <Chart config={CHART_CONFIGS.chart1} chartType={chartType} />
  <Chart config={CHART_CONFIGS.chart2} chartType={chartType} />
  <Chart config={CHART_CONFIGS.chart3} chartType={chartType} />
</TabsContent>
```

### Enable Retailer Filter
```typescript
myChart: {
  id: 'myChart',
  title: 'My Chart',
  enableRetailerFilter: true, // Add this line
  query: { ... },
  pivotConfig: { ... }
}
```

### Filter Data
```typescript
query: {
  dimensions: ['category.name'],
  filters: [
    { member: 'price', operator: 'gt', values: ['100'] },
    { member: 'status', operator: 'equals', values: ['active'] }
  ],
  measures: ['price.avg']
}
```

### Change Time Granularity
```typescript
timeDimensions: [
  { 
    dimension: 'date', 
    granularity: 'week' // day, week, month, quarter, year
  }
]
```

### Limit Results
```typescript
query: {
  dimensions: ['retailer.name'],
  measures: ['sales.total'],
  order: { 'sales.total': 'desc' },
  limit: 10 // Top 10
}
```

## Need More Examples?

Check `chartConfigs.example.ts` for 6 detailed examples covering:
- Price comparisons
- Top performers
- Multiple measures
- Category breakdowns
- Year-over-year analysis
- And more!
