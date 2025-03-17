import { Component } from "@angular/core";
import { QueryComponent } from "./query/query.component";

@Component({
  selector: "app-sql",
  imports: [QueryComponent],
  templateUrl: "./sql.component.html",
  styleUrl: "./sql.component.css",
})
export class SqlComponent {}
