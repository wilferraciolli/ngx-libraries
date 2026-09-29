import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BarGraph,
  LineGraph,
  PieGraph,
  DoughnutGraph,
  PolarAreaGraph,
  RadarGraph,
  BubbleGraph,
  ScatterGraph,
  graphConfig,
  pointGraphConfig
} from '@wiltech-labs/ngx-graphs';

@Component({
  selector: 'app-graphs-demo',
  standalone: true,
  imports: [
    CommonModule,
    BarGraph,
    LineGraph,
    PieGraph,
    DoughnutGraph,
    PolarAreaGraph,
    RadarGraph,
    BubbleGraph,
    ScatterGraph
  ],
  templateUrl: './graphs-demo.component.html',
  styleUrls: ['./graphs-demo.component.css']
})
export class GraphsDemoComponent {
  protected readonly salesByQuarter = graphConfig()
    .labels(['Q1', 'Q2', 'Q3', 'Q4'])
    .series('2025', [120, 150, 180, 210])
    .series('2026', [140, 170, 200, 240])
    .title('Sales by quarter')
    .build();

  protected readonly websiteTraffic = graphConfig()
    .labels(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
    .series('Visitors', [820, 932, 901, 934, 1290, 1330, 1320])
    .title('Website traffic')
    .build();

  protected readonly marketShare = graphConfig()
    .labels(['EMEA', 'APAC', 'Americas'])
    .series('Share', [45, 30, 25])
    .title('Market share')
    .build();

  protected readonly salesChannels = graphConfig()
    .labels(['Online', 'Retail', 'Partners'])
    .series('Revenue', [300, 500, 100])
    .title('Sales by channel')
    .build();

  protected readonly salesByRegion = graphConfig()
    .labels(['North', 'South', 'East', 'West', 'Central'])
    .series('Revenue', [300, 500, 100, 40, 120])
    .title('Sales by region')
    .build();

  protected readonly skillsProfile = graphConfig()
    .labels(['Speed', 'Reliability', 'Comfort', 'Safety', 'Efficiency', 'Design'])
    .series('Model A', [65, 59, 90, 81, 56, 55])
    .series('Model B', [28, 48, 40, 19, 96, 27])
    .title('Model comparison')
    .build();

  protected readonly clusterSizes = pointGraphConfig()
    .series('Cluster A', [
      { x: 10, y: 10, r: 10 },
      { x: 15, y: 5, r: 15 },
      { x: 26, y: 12, r: 23 },
      { x: 7, y: 8, r: 8 }
    ])
    .title('Cluster sizes')
    .build();

  protected readonly measurements = pointGraphConfig()
    .series('Sample', [
      { x: 1, y: 1 },
      { x: 2, y: 3 },
      { x: 3, y: -2 },
      { x: 4, y: 4 },
      { x: 5, y: -3 }
    ])
    .title('Measurements')
    .build();
}
