import { Routes } from "@angular/router";

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
    ],
  },
];
