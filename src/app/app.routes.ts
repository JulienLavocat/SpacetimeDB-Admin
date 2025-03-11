import { Routes } from "@angular/router";
import { provideStates } from "@ngxs/store";
import { SqlState } from "./pages/sql/sql.state";

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
    ],
  },
];
