import { graphConfig, pointGraphConfig } from '@wiltech-labs/ngx-graphs';

// Shared sample data for every chart-type story file in this folder, so the catalogue tells one
// consistent story (quarterly sales, a single metric, a wide category list) across all 8 types.

export const quarterlySales = graphConfig()
  .labels(['Q1', 'Q2', 'Q3', 'Q4'])
  .series('2025', [120, 150, 180, 210])
  .series('2026', [140, 170, 200, 240])
  .title('Sales by quarter')
  .build();

export const singleMetric = graphConfig()
  .labels(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
  .series('Visitors', [820, 932, 901, 934, 1290, 1330, 1320])
  .title('Website traffic')
  .build();

export const marketShare = graphConfig()
  .labels(['EMEA', 'APAC', 'Americas'])
  .series('Share', [45, 30, 25])
  .title('Market share')
  .build();

export const manyCategories = graphConfig()
  .labels(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])
  .series('2026', [42, 38, 55, 61, 58, 70, 74, 69, 60, 52, 47, 63])
  .title('Monthly active users')
  .build();

export const empty = graphConfig().labels([]).title('No data yet').build();

export const clusterSizes = pointGraphConfig()
  .series('Cluster A', [
    { x: 10, y: 10, r: 10 },
    { x: 15, y: 5, r: 15 },
    { x: 26, y: 12, r: 23 },
    { x: 7, y: 8, r: 8 },
  ])
  .series('Cluster B', [
    { x: 20, y: 25, r: 12 },
    { x: 24, y: 18, r: 6 },
  ])
  .title('Cluster sizes')
  .build();

export const scatterPoints = pointGraphConfig()
  .series('Measurements', [
    { x: 2, y: 4 },
    { x: 4, y: 7 },
    { x: 6, y: 6 },
    { x: 8, y: 11 },
    { x: 10, y: 9 },
    { x: 12, y: 14 },
  ])
  .title('Response time vs. load')
  .build();
