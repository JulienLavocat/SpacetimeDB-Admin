import { importProvidersFrom } from '@angular/core';
import { Routes } from '@angular/router';
import { NgxsModule } from '@ngxs/store';
import { AppState } from './app.state';
import { LogsExplorerComponent } from './logs-explorer/logs-explorer.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LogsState } from './logs-explorer/logs.state';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: DashboardComponent,
  },
  {
    path: 'logs',
    component: LogsExplorerComponent,
    providers: [
      importProvidersFrom(NgxsModule.forFeature([AppState, LogsState])),
    ],
  },
];
