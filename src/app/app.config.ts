import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { providePrimeNG } from "primeng/config";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import Aura from "@primeng/themes/aura";

import { routes } from "./app.routes";
import { withNgxsReduxDevtoolsPlugin } from "@ngxs/devtools-plugin";
import { withNgxsLoggerPlugin } from "@ngxs/logger-plugin";
import { provideStore } from "@ngxs/store";
import { AppState } from "./app.state";
import { provideApi } from "./api.service";
import { MonacoEditorModule } from "ngx-monaco-editor-v2";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
    provideApi(),
    provideAnimationsAsync(),
    provideStore(
      [AppState],
      withNgxsReduxDevtoolsPlugin(),
      withNgxsLoggerPlugin(),
    ),
    importProvidersFrom([MonacoEditorModule.forRoot()]),
  ],
};
