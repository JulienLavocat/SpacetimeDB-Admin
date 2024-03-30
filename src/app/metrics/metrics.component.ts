import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { BaseChartDirective } from 'ng2-charts';
import { MetricsState } from './metrics.state';
import ChartDatasourcePrometheusPlugin from 'chartjs-plugin-datasource-prometheus';
import {
  AVG_TX_CPU_TIME,
  AVG_TX_DURATION,
  COMMITS_PER_SECOND,
  ROLLBACKS_PER_SECOND,
  TOTAL_TRANSACTIONS,
  TOTAL_TX_CPU_TIME,
  TOTAL_TX_DURATION,
  TOTAL_TX_PER_SECOND,
  TX_CPU_TIME_MAX,
  TX_CPU_TIME_P90,
  TX_CPU_TIME_P99,
  TX_DURATION_P90,
  TX_DURATION_P99,
} from './metrics.queries';
import { ChartConfiguration } from 'chart.js';
import { AppState } from '../app.state';
import { MatCardModule } from '@angular/material/card';

export type QueryOptions = ChartConfiguration['options'] & {
  plugins: Record<string, any>;
};
@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, MatCardModule],
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.scss',
})
export class MetricsComponent {
  private readonly store = inject(Store);
  queries: QueryOptions[][] = [
    [
      this.makeDatasource(TOTAL_TRANSACTIONS, 'Total Transactions'),
      this.makeDatasource(TOTAL_TX_PER_SECOND, 'Tx per second'),
    ],
    [
      this.makeDatasource(TOTAL_TX_DURATION, 'Total Tx duration', {
        scales: {
          y: {
            type: 'time',
          },
        },
      }),
      this.makeDatasource(TOTAL_TX_CPU_TIME, 'Total Tx CPU Time'),
    ],
    [
      this.makeDatasource(AVG_TX_DURATION, 'Average Tx duration'),
      this.makeDatasource(AVG_TX_CPU_TIME, 'Average Tx CPU Time'),
    ],
    [
      this.makeDatasource(COMMITS_PER_SECOND, 'Commits per second'),
      this.makeDatasource(ROLLBACKS_PER_SECOND, 'Rollbacks per second'),
    ],
    [
      this.makeDatasource(TX_DURATION_P99, 'Tx Duration P99'),
      this.makeDatasource(TX_DURATION_P90, 'Tx Duration P90'),
    ],
    [
      this.makeDatasource(TX_CPU_TIME_P99, 'Tx CPU Time P99'),
      this.makeDatasource(TX_CPU_TIME_P90, 'Tx CPU Time P90'),
    ],
    [this.makeDatasource(TX_CPU_TIME_MAX, 'Tx CPU Time MAX')],
  ];
  plugins = [ChartDatasourcePrometheusPlugin] as any;

  private makeDatasource(
    query: string,
    title: string,
    overrides: ChartConfiguration['options'] = {},
  ): QueryOptions {
    const { range, rateInterval, updateInterval, start } =
      this.store.selectSnapshot(MetricsState.params);

    return {
      ...overrides,
      animation: {
        duration: 0,
        ...overrides.animation,
      },
      responsive: true,
      maintainAspectRatio: true,
      scales: { y: { beginAtZero: true } },
      plugins: {
        ...overrides.plugins,
        title: {
          display: true,
          text: title,
          ...overrides.plugins?.title,
        },
        legend: {
          position: 'bottom',
          ...overrides.plugins?.legend,
        },
        'datasource-prometheus': {
          prometheus: {
            endpoint: 'http://localhost:9090',
          },
          query: query
            .replaceAll('$__range', range)
            .replaceAll('$__rate_interval', rateInterval)
            .replaceAll(
              '$__database',
              this.store.selectSnapshot(AppState.databaseAddress),
            ),
          timeRange: {
            type: 'relative',
            msUpdateInterval: updateInterval,
            start: start,
            end: 0,
          },
        },
      },
    };
  }
}
