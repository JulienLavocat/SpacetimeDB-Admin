import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from "@angular/core";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideRouter } from "@angular/router";
import Aura from "@primeng/themes/aura";
import { providePrimeNG } from "primeng/config";
import { withNgxsReduxDevtoolsPlugin } from "@ngxs/devtools-plugin";
import { withNgxsLoggerPlugin } from "@ngxs/logger-plugin";
import { withNgxsStoragePlugin } from "@ngxs/storage-plugin";
import { provideStore } from "@ngxs/store";
import { MonacoEditorModule } from "ngx-monaco-editor-v2";
import { MessageService } from "primeng/api";
import { provideApi } from "./api/api.provider";
import { routes } from "./app.routes";
import { AppState } from "./app.state";

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
      withNgxsStoragePlugin({ keys: [AppState] }),
    ),
    importProvidersFrom([
      MonacoEditorModule.forRoot({
        baseUrl: window.location.origin + "/assets/monaco/min/vs",
      }),
    ]),
    MessageService,
  ],
};
