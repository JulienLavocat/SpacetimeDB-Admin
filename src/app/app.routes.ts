import { Routes } from "@angular/router";
import { provideStates } from "@ngxs/store";
import { SqlState } from "./pages/sql/sql.state";
import { SchemaState } from "./pages/schema/schema.state";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./layout/layout.component").then((m) => m.LayoutComponent),
    children: [
      {
        path: "settings",
        loadComponent: () =>
          import("./pages/settings/settings.component").then(
            (m) => m.SettingsComponent,
          ),
      },
      {
        path: "sql",
        providers: [provideStates([SqlState])],
        loadComponent: () =>
          import("./pages/sql/sql.component").then((m) => m.SqlComponent),
      },
      {
        path: "schema",
        providers: [provideStates([SchemaState])],
        loadComponent: () =>
          import("./pages/schema/schema.component").then(
            (m) => m.SchemaComponent,
          ),
      },
      {
        path: "logs",
        loadComponent: () =>
          import("./pages/logs/logs.component").then((m) => m.LogsComponent),
      },
    ],
  },
];
