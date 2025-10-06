# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - 2025-10-06

#### Retail Price Intelligence Hub Dashboard
- **New Dashboard Page** at `/charts/dashboard`
  - Comprehensive BI dashboard for retail price analysis
  - Four analytical tabs: Executive Overview, Competitor Analysis, Category Deep Dive, Geographical Insights
  
- **Global Header with KPIs**
  - Overall Average Retail Price indicator
  - Overall Average Promo Price indicator
  - Average Discount Percentage indicator
  - Real-time data freshness timestamp
  
- **Global Filters**
  - Date Range Selector with dual-month calendar picker
  - Retailer Multi-Select filter
  - Location Multi-Select filter
  - Category Multi-Select filter
  - "Clear All" functionality
  
- **Executive Overview Tab**
  - Min/Max/Median price statistics cards
  - Price trends over time chart (retail vs promotional)
  - Average price by category bar chart
  
- **Competitor Analysis Tab**
  - Retailer price trends line chart
  - Average price by retailer comparison
  - Discount rates by retailer visualization
  
- **Category Deep Dive Tab**
  - Category price trends over time
  - Price range analysis (min/avg/max)
  - Top 10 categories pie chart
  
- **Geographical Insights Tab**
  - Regional price trends by municipality
  - Top 20 settlements by average price
  - Top 15 municipalities comparison
  
- **UI Components**
  - Calendar component for date range selection
  - Dashboard-specific filter components
  - Responsive card layouts
  - Loading states and skeleton loaders
  
- **Dependencies**
  - `date-fns@^3.0.0` for date manipulation
  - `react-day-picker@^8.10.0` for calendar UI
  - `react-is` for React utilities

### Changed
- Updated routing to include `/charts/dashboard` route
- Enhanced ChartViewer component to support multiple use cases
- Improved global filter state management

### Technical Details
- Full TypeScript implementation
- Cube.js integration for OLAP queries
- Radix UI components for accessible UI
- Tailwind CSS for styling
- Support for light/dark themes
- Responsive design for all screen sizes

### Documentation
- Added `DASHBOARD_README.md` with comprehensive documentation
- Included setup instructions and troubleshooting guide
- Documented Cube.js schema requirements
- Added performance optimization recommendations
