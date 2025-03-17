import { Routes } from "@angular/router";
import { provideStates } from "@ngxs/store";
import { SchemaState } from "./pages/schema/schema.state";
import { LogsState } from "./pages/logs/logs.state";
import { ReducersState } from "./pages/reducers/reducers.state";
import { dbNotSetGuard } from "./utils/db-not-set.guard";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./layout/layout.component").then((m) => m.LayoutComponent),
    children: [
      {
        path: "",
        redirectTo: "logs",
        pathMatch: "full",
      },
      {
        path: "settings",
        loadComponent: () =>
          import("./pages/settings/settings.component").then(
            (m) => m.SettingsComponent,
          ),
      },
      {
        path: "sql",
        canActivate: [dbNotSetGuard],
        loadComponent: () =>
          import("./pages/sql/sql.component").then((m) => m.SqlComponent),
      },
      {
        path: "schema",
        canActivate: [dbNotSetGuard],
        providers: [provideStates([SchemaState])],
        loadComponent: () =>
          import("./pages/schema/schema.component").then(
            (m) => m.SchemaComponent,
          ),
      },
      {
        path: "logs",
        canActivate: [dbNotSetGuard],
        providers: [provideStates([LogsState])],
        loadComponent: () =>
          import("./pages/logs/logs.component").then((m) => m.LogsComponent),
      },
      {
        path: "reducers",
        canActivate: [dbNotSetGuard],
        providers: [provideStates([SchemaState, ReducersState])],
        loadComponent: () =>
          import("./pages/reducers/reducers.component").then(
            (m) => m.ReducersComponent,
          ),
      },
    ],
  },
];
