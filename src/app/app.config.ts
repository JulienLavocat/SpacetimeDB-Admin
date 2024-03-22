import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NgxsModule } from '@ngxs/store';
import { AppState } from './app.state';
import { provideHttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';

export class AppConfig {
  apiUrl = 'http://localhost:3000';
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    importProvidersFrom(
      NgxsModule.forRoot([AppState], { developmentMode: true }),
      NgxsReduxDevtoolsPluginModule.forRoot(),
    ),
    AppConfig,
    ApiService,
  ],
};
