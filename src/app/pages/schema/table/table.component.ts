import { Component, input, OnInit } from "@angular/core";
import { CardModule } from "primeng/card";
import {
  printAlgebraicType,
  ProductTypeElement,
  RawModuleRef9,
  Table,
} from "../../../api/raw-types";

@Component({
  selector: "app-table",
  imports: [CardModule],
  templateUrl: "./table.component.html",
  styleUrl: "./table.component.css",
})
export class TableComponent implements OnInit {
  readonly table = input.required<Table>();
  readonly schema = input.required<RawModuleRef9>();

  ngOnInit() {}

  showColumn(column: ProductTypeElement) {
    return `${column.name.some}: ${printAlgebraicType(this.schema(), column.algebraic_type)}`;
  }
}
