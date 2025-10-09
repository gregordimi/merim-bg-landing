# Chart Data Behavior

## Current Behavior

### Initial Chart Display
The chart initially shows **all retailers that have at least ONE data point in the last 30 days**.

### Why Some Retailers Don't Appear Initially

If a retailer doesn't appear on the initial chart, it's because:
1. They have **no data** in the last 30 days, OR
2. Their tracking started **after** the 30-day window

### Retailers with Partial Data

Retailers that started tracking recently (e.g., 5 days ago) will:
- ✅ **Appear on the chart** (because they have data in the 30-day window)
- ✅ **Show gaps** for dates before tracking started (handled with `connectNulls`)
- ✅ **Have shorter lines** than retailers with complete data

### Example Scenario

**Last 30 days window**: Jan 1 - Jan 30

- **Billa**: Has data for all 30 days → Shows full line
- **Lidl**: Has data for all 30 days → Shows full line  
- **Kaufland**: Started tracking Jan 25 → Shows line from Jan 25-30 only
- **Fantastico**: No data in last 30 days → Doesn't appear initially

## Using the Retailer Filter

The **retailer dropdown** shows **ALL retailers** in your database, regardless of whether they have recent data.

You can:
1. Select retailers with no recent data from the dropdown
2. The chart will show them (with no data points if they have none)
3. Mix retailers with different data availability

## If You Want Different Behavior

### Option 1: Show ALL Retailers Always

To show all retailers even with no data, you would need to:
1. Fetch all retailers separately
2. Merge them with chart data
3. Fill missing values with null

This would make the chart more cluttered but show everyone.

### Option 2: Adjust Date Range

Change the date range to capture more data:

```typescript
dateRange: "Last 90 days"  // Instead of 30 days
```

This would include retailers that started tracking 60 days ago.

### Option 3: Use "All Time" Data

```typescript
dateRange: undefined  // Get all available data
```

This shows all retailers with any data ever, but may be slow with large datasets.

## Current Configuration

```typescript
query: {
  timeDimensions: [
    {
      dimension: "prices.price_date",
      granularity: "day",
      dateRange: "Last 30 days"  // ← Controls what appears initially
    }
  ]
}
```

## Recommendation

The current behavior is **optimal** because:
- ✅ Shows recent, relevant data
- ✅ Fast query performance
- ✅ All retailers available in dropdown
- ✅ Users can select any retailer they want
- ✅ Handles partial data gracefully

If you need to see retailers with older data, simply:
1. Open the retailer dropdown
2. Select the retailers you want
3. They'll appear on the chart (even if they have no recent data)
