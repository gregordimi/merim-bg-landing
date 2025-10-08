/**
 * Debug utilities for pre-aggregation matching
 */

import { Query } from "@cubejs-client/core";

export interface PreAggregationDebugInfo {
  querySignature: string;
  measures: string[];
  dimensions: string[];
  timeDimensions: string[];
  filters: string[];
  granularity?: string;
  dateRange?: string;
  matchingTips: string[];
}

export function analyzeQuery(query: Query): PreAggregationDebugInfo {
  const measures = query.measures || [];
  const dimensions = query.dimensions || [];
  const timeDimensions = query.timeDimensions || [];
  const filters = query.filters || [];
  
  const granularity = timeDimensions[0]?.granularity;
  const dateRange = timeDimensions[0]?.dateRange;
  
  const querySignature = [
    `Measures: ${measures.join(', ')}`,
    `Dimensions: ${dimensions.join(', ')}`,
    `TimeDimensions: ${timeDimensions.map(td => `${td.dimension}(${td.granularity})`).join(', ')}`,
    `Filters: ${filters.map(f => `${f.member} ${f.operator} ${f.values?.join(',')}`).join(', ')}`,
  ].filter(Boolean).join(' | ');

  const matchingTips = [];
  
  // Check for non-additive measures
  const nonAdditiveMeasures = measures.filter(m => 
    m.includes('average') || m.includes('median') || m.includes('percentile')
  );
  if (nonAdditiveMeasures.length > 0) {
    matchingTips.push(`⚠️  Non-additive measures detected: ${nonAdditiveMeasures.join(', ')}. These are harder to match with pre-aggregations.`);
  }
  
  // Check for time dimension requirements
  if (timeDimensions.length > 0) {
    matchingTips.push(`✅ Time dimension found: ${timeDimensions[0].dimension} with ${granularity} granularity`);
    matchingTips.push(`📅 Date range: ${dateRange}`);
  } else {
    matchingTips.push(`ℹ️  No time dimensions - query can match non-time pre-aggregations`);
  }
  
  // Suggest pre-aggregation structure
  if (measures.length > 0 && dimensions.length > 0) {
    const preAggSuggestion = [
      `measures: [${measures.join(', ')}]`,
      `dimensions: [${dimensions.join(', ')}]`,
      timeDimensions.length > 0 ? `timeDimension: ${timeDimensions[0].dimension}` : null,
      timeDimensions.length > 0 ? `granularity: '${granularity}'` : null,
    ].filter(Boolean).join(', ');
    
    matchingTips.push(`🎯 Suggested pre-aggregation: { ${preAggSuggestion} }`);
  }
  
  return {
    querySignature,
    measures,
    dimensions,
    timeDimensions: timeDimensions.map(td => `${td.dimension}(${td.granularity})`),
    filters: filters.map(f => `${f.member} ${f.operator} ${f.values?.join(',')}`),
    granularity,
    dateRange,
    matchingTips,
  };
}

export function logQueryAnalysis(query: Query, label?: string) {
  const analysis = analyzeQuery(query);
  
  console.group(`🔍 Query Analysis${label ? ` - ${label}` : ''}`);
  console.log('📋 Query Signature:', analysis.querySignature);
  console.log('📊 Measures:', analysis.measures);
  console.log('📐 Dimensions:', analysis.dimensions);
  console.log('⏰ Time Dimensions:', analysis.timeDimensions);
  console.log('🔍 Filters:', analysis.filters);
  
  if (analysis.matchingTips.length > 0) {
    console.log('💡 Matching Tips:');
    analysis.matchingTips.forEach(tip => console.log(`  ${tip}`));
  }
  
  console.groupEnd();
  
  return analysis;
}

/**
 * Pre-aggregation matching checklist based on Cube.js docs
 */
export const PRE_AGGREGATION_CHECKLIST = {
  "1. Additive Measures": "✅ All measures should be additive (sum, count, min, max) for best matching",
  "2. Exact Member Match": "✅ Pre-aggregation must contain ALL dimensions and measures from query",
  "3. Time Dimension": "✅ Query granularity must match pre-aggregation granularity exactly",
  "4. Filter Dimensions": "✅ All filter dimensions must be included as dimensions in pre-aggregation",
  "5. Date Range Alignment": "✅ Date ranges should align with granularity boundaries",
  "6. Order of Definition": "✅ Rollup pre-aggregations are tested before original_sql ones",
};

export function printPreAggregationChecklist() {
  console.group('📋 Pre-Aggregation Matching Checklist');
  Object.entries(PRE_AGGREGATION_CHECKLIST).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
  console.groupEnd();
}