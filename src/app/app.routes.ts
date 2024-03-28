import { Routes } from '@angular/router';
import { LogsExplorerComponent } from './logs-explorer/logs-explorer.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SetDatabaseComponent } from './set-database/set-database.component';
import { SqlComponent } from './sql/sql.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DashboardComponent,
    data: {
      title: 'Dashboard',
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
];
