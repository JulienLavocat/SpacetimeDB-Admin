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
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SetRangeAction } from './metrics.actions';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

export type QueryOptions = ChartConfiguration['options'] & {
  plugins: Record<string, any>;
};
@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
    FormsModule,
    MatCardModule,
    MatToolbarModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
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
  ranges = [
    { value: -1 * 60 * 1000, name: 'Last 1 min' },
    { value: -5 * 60 * 1000, name: 'Last 5 min' },
    { value: -15 * 60 * 1000, name: 'Last 15 min' },
    { value: -30 * 60 * 1000, name: 'Last 30 min' },
    { value: -1 * 3600 * 1000, name: 'Last 1h' },
    { value: -3 * 3600 * 1000, name: 'Last 3h' },
    { value: -6 * 3600 * 1000, name: 'Last 6h' },
    { value: -12 * 3600 * 1000, name: 'Last 12h' },
    { value: -24 * 3600 * 1000, name: 'Last 24h' },
    { value: -72 * 3600 * 1000, name: 'Last 3d' },
    { value: -168 * 3600 * 1000, name: 'Last 7d' },
  ];
  range$ = toSignal(this.store.select(MetricsState.range));

  onRangeChange(range: number) {
    this.store.dispatch(new SetRangeAction(range));
  }

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
      scales: {
        y: { beginAtZero: true },
        x: {
          type: 'time',
          adapters: {
            date: {
              locale: 'fr',
            },
          },
        },
      },
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
            start,
            end: 0,
          },
          dataSetHook: (dataSets: any[]) => {
            return dataSets.map((data) => ({
              ...data,
              label: this.formatLabel(data.label),
            }));
          },
        },
      },
    };
  }

  private formatLabel(label: string): string {
    let hasDatabaseLabel = true;
    const results = label
      .substring(1, label.length - 1)
      .split(',')
      .map((e) =>
        e
          .replace(/db=".*"/, '')
          .replaceAll('txn_type=', '')
          .replaceAll('reducer=', '')
          .replaceAll('"', ''),
      )
      .filter(Boolean);

    if (hasDatabaseLabel && results.length === 0) return 'Value';

    return results.join(' ');
  }
}
