import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { MenuItem, PrimeIcons } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { DialogService } from "primeng/dynamicdialog";
import { MenubarModule } from "primeng/menubar";
import { ToolbarModule } from "primeng/toolbar";

@Component({
  selector: "app-layout",
  imports: [ToolbarModule, ButtonModule, RouterModule, MenubarModule],
  providers: [DialogService],
  templateUrl: "./layout.component.html",
  styleUrl: "./layout.component.scss",
})
export class LayoutComponent {
  startToolbar: MenuItem[] = [
    {
      routerLink: "/metrics",
      label: "Metrics",
      icon: PrimeIcons.CHART_LINE,
    },
    {
      routerLink: "/logs",
      label: "Logs",
      icon: PrimeIcons.ALIGN_JUSTIFY,
    },
    {
      routerLink: "/sql",
      label: "SQL",
      icon: PrimeIcons.DATABASE,
    },
    {
      routerLink: "/schema",
      label: "Schema",
      icon: PrimeIcons.SITEMAP,
    },
  ];
}
