import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NgxsModule } from '@ngxs/store';
import { AppState } from './app.state';
import { provideHttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { LogsState } from './logs-explorer/logs.state';
import { SqlState } from './sql/sql.state';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { MetricsState } from './metrics/metrics.state';
import 'chartjs-adapter-luxon';
import * as luxon from 'luxon';

export class AppConfig {
  apiUrl = 'http://localhost:3000';
}

luxon.Settings.defaultLocale = navigator.language;

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    importProvidersFrom(
      NgxsModule.forRoot([AppState, LogsState, SqlState, MetricsState], {
        developmentMode: true,
      }),
      NgxsReduxDevtoolsPluginModule.forRoot(),
      MonacoEditorModule.forRoot(),
    ),
    AppConfig,
    ApiService,
    provideCharts(withDefaultRegisterables()),
  ],
};
