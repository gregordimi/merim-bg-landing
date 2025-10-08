# Chart Debug Guide

## 🔧 Debug Console Access

Navigate to: **`/charts/debug`**

Or use the floating debug navigation button in the top-right corner when on dashboard pages.

## 🎯 Purpose

The Chart Debug Console allows you to:

1. **Test each chart component individually**
2. **Verify query consistency** - same filters should generate identical queries
3. **Monitor performance improvements** - pre-aggregation cache hits
4. **Debug filter behavior** - see exactly what filters are being applied
5. **Validate the refactor** - ensure all components work correctly

## 📊 Available Charts

### Executive Overview Charts
- **📊 Stats Cards** - Min/Max/Median price statistics
- **📈 Trend Chart** - Price trends over time
- **🛒 Category Chart** - Price comparison by category

### Geographical Charts  
- **🗺️ Regional Trend** - Municipality price trends over time
- **🏘️ Settlement Chart** - Top 20 settlements price comparison
- **🏛️ Municipality Chart** - Top 15 municipalities price comparison

## 🧪 Testing Scenarios

### 1. Query Consistency Test
1. Select a chart tab
2. Apply filters using the "Full Filters" preset
3. Wait for the chart to load
4. Switch to another tab and back
5. **Expected:** No new network requests, instant loading

### 2. Performance Test
1. Clear browser cache
2. Load a chart with "Empty Filters" preset
3. **Expected:** First load 3-5 seconds, subsequent loads <500ms
4. Check browser Network tab for query patterns

### 3. Filter Stability Test
1. Apply the same filters multiple times
2. Check the Debug Log section
3. **Expected:** Filter objects should be identical each time

## 🔍 What to Monitor

### Browser Developer Tools

**Network Tab:**
- Look for `/cubejs-api/v1/load` requests
- Same filters should generate identical query payloads
- No duplicate requests for the same query

**Console:**
- Check for debug logs showing filter changes
- Look for any error messages
- Monitor component re-render frequency

### Cube.js Server Logs
- Look for "Building pre-aggregation" messages
- Check for "Using pre-aggregation" vs "Querying raw data"
- Monitor query execution times

## 🚀 Performance Expectations

### Before Refactor (Old Architecture)
- ❌ 5+ second queries every time
- ❌ Multiple duplicate queries
- ❌ No pre-aggregation cache hits
- ❌ Inconsistent query patterns

### After Refactor (New Architecture)
- ✅ First load: 3-5 seconds (building cache)
- ✅ Subsequent loads: <500ms (cache hits)
- ✅ Same filters = identical queries
- ✅ No duplicate network requests
- ✅ Stable component re-renders

## 🛠️ Debug Features

### Filter Controls
- **Manual Input:** Enter comma-separated values for each filter type
- **Test Presets:** Quick filter combinations for testing
- **Real-time Updates:** See filter changes immediately

### Debug Log
- **Filter Changes:** Timestamps and filter state changes
- **Query Consistency:** Monitor when filters are updated
- **Performance Tracking:** See exactly when re-renders occur

### Visual Indicators
- **Loading States:** Clear indication when queries are running
- **Error Handling:** Graceful error display if queries fail
- **Performance Badges:** Current filter state summary

## 🔧 Troubleshooting

### Chart Not Loading
1. Check browser console for errors
2. Verify Cube.js API connection
3. Check filter syntax (comma-separated values)

### Slow Performance
1. Check if pre-aggregations are built (Cube.js logs)
2. Verify query consistency (Network tab)
3. Look for unnecessary re-renders (React DevTools)

### Inconsistent Queries
1. Check Debug Log for filter stability
2. Monitor Network tab for query variations
3. Verify component dependencies are stable

## 📈 Success Metrics

**Query Consistency:** ✅ Same filters = same query hash  
**Performance:** ✅ <500ms for cached queries  
**Stability:** ✅ No unnecessary re-renders  
**Caching:** ✅ Pre-aggregation cache hits  
**User Experience:** ✅ Smooth, responsive interface  

## 🎯 Next Steps

After validating the debug console:

1. **Performance Monitoring:** Set up production monitoring
2. **Error Boundaries:** Add comprehensive error handling  
3. **Optimization:** Fine-tune pre-aggregation strategies
4. **Documentation:** Update component documentation
5. **Testing:** Add automated tests for query consistency

---

**Happy Debugging!** 🚀

Use this console to verify that the dashboard refactor has successfully solved the query consistency and performance issues.