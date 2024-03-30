import { Routes } from '@angular/router';
import { LogsExplorerComponent } from './logs-explorer/logs-explorer.component';
import { SetDatabaseComponent } from './set-database/set-database.component';
import { SqlComponent } from './sql/sql.component';
import { SchemaComponent } from './schema/schema.component';
import { MetricsComponent } from './metrics/metrics.component';
import { resolveDatabaseAddress } from './metrics/metrics.resolver';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'metrics',
  },
  {
    path: 'metrics',
    component: MetricsComponent,
    data: {
      title: 'Metrics',
    },
    resolve: {
      address: resolveDatabaseAddress,
    },
  },
  {
    path: 'logs',
    component: LogsExplorerComponent,
    data: {
      title: 'Logs',
    },
  },
  {
    path: 'set-database',
    data: {
      title: 'Set database',
    },
    component: SetDatabaseComponent,
  },
  {
    path: 'sql',
    data: {
      title: 'SQL',
    },
    component: SqlComponent,
  },
  {
    path: 'schema',
    data: {
      title: 'Schema',
    },
    component: SchemaComponent,
  },
];
