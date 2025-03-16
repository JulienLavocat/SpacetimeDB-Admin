import { Component } from "@angular/core";
import { Chart, ChartOptions } from "chart.js";
import "chartjs-adapter-date-fns";
import ChartPrometheusDatasourcePlugin from "chartjs-plugin-datasource-prometheus";
import { CardModule } from "primeng/card";
import { ChartModule } from "primeng/chart";

Chart.registry.plugins.register(ChartPrometheusDatasourcePlugin);

@Component({
  selector: "app-metrics",
  imports: [ChartModule, CardModule],
  templateUrl: "./metrics.component.html",
  styleUrl: "./metrics.component.scss",
})
export class MetricsComponent {
  optionsRowsInTable: ChartOptions = this.createProm({
    title: "Rows per table over time",
    query:
      'spacetime_num_table_rows{table_name!~"st_client|st_column|st_index|st_constraint|st_module|st_row_level_security|st_scheduled|st_sequence|st_table|st_var", db="$database"}',

    findInLabelMap: (metric) => metric.labels["table_name"],
  });
  optionsTotalTxns = this.createProm({
    title: "Total transactions over time",

    query: 'spacetime_num_txns_total{db="$database",txn_type!="Update"}',
    findInLabelMap: (metric) =>
      metric.labels["reducer"] ?? metric.labels["txn_type"],
  });
  optionsActiveSubscriptions = this.createProm({
    title: "Active subscriptions over time",
    query: 'spacetime_active_queries{database_identity="$database"}',
    findInLabelMap: () => "Active subscriptions",
  });
  optionsTotalCCU = this.createProm({
    title: "Connected users over time",
    query: 'spacetime_worker_connected_clients{database_identity="$database"}',
    findInLabelMap: () => "Connected clients",
  });

  private createProm({
    query,
    title,
    findInLabelMap,
  }: {
    query: string;
    title: string;
    findInLabelMap: (metric: {
      name: string;
      labels: Record<string, string>;
    }) => string;
  }) {
    const start = -15 * 60 * 1000;
    const database =
      "c200e6332ea5aeca747e0517e167d3260c776c5094f07706bb6a8c42c9f94137";

    return {
      aspectRatio: 0.6,
      plugins: {
        "datasource-prometheus": {
          prometheus: {
            endpoint: "http://localhost:9090",
          },
          query: query.replaceAll("$database", database),
          findInLabelMap,
          timeRange: {
            type: "relative",
            start,
            end: 0,
          },
        },
        legend: {
          position: "bottom",
        },
        title: {
          display: true,
          text: title,
        },
      } as any,
    };
  }
}
