import { Component, inject, input, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { ButtonModule } from "primeng/button";
import { TableModule } from "primeng/table";
import { ApiService, View } from "../../../api";
import { DividerModule } from "primeng/divider";
import { catchError, of, take, tap } from "rxjs";
import { MessageModule } from "primeng/message";
import { SelectChangeEvent, SelectModule } from "primeng/select";
import { algebraicTypeToColumn, parseRows } from "../../../api/sql.parser";
import { TagModule } from "primeng/tag";

@Component({
  selector: "app-view-tab",
  imports: [
    InputTextModule,
    FormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    ButtonModule,
    TableModule,
    DividerModule,
    MessageModule,
    SelectModule,
    TagModule,
  ],
  templateUrl: "./view-tab.component.html",
  styleUrl: "./view-tab.component.scss",
})
export class ViewTabComponent implements OnInit, OnDestroy {
  private readonly apiService = inject(ApiService);

  readonly view = input.required<View>();

  isLoading: boolean = true;
  whereClause: string = "";
  rows: any[] = [];
  columns: { name: string; type: string }[] = [];
  totalRows: number = 0;
  tableColumns!: string[];
  error?: string;

  firstRow: number = 0;
  rowsPerPage: number = 25;
  availableRows: number[] = [10, 25, 50, 100, 1000];
  allSelected: boolean = false;

  autoRefreshInterval: number = 5000;
  availableIntervals: { value: number; name: string }[] = [
    { value: 0, name: "Off" },
    { value: 1000, name: "1s" },
    { value: 5000, name: "5s" },
    { value: 10000, name: "10s" },
    { value: 30000, name: "30s" },
    { value: 60000, name: "1m" },
  ];
  autoRefreshTimer?: number;

  ngOnInit(): void {
    this.tableColumns = this.view().columns.map((e) => e.name);
    this.queryView();
  }

  ngOnDestroy(): void {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
      this.autoRefreshTimer = undefined;
    }
  }

  queryView(): void {
    let query = `SELECT * FROM ${this.view().name}`;
    if (this.whereClause.trim() !== "") {
      query += ` WHERE ${this.whereClause}`;
    }

    this.isLoading = true;
    this.error = undefined;

    this.apiService
      .runQuery(query)
      .pipe(
        take(1),
        tap((results) => {
          const result = results[0];
          this.rows = parseRows(result.rows, result.schema.elements);
          this.columns = result.schema.elements.map((e, i) => ({
            name: e.name?.some ?? `col_${i}`,
            type: algebraicTypeToColumn(e.algebraic_type),
          }));
          this.totalRows = result.rows.length;
          this.isLoading = false;
          if (this.firstRow >= this.totalRows) {
            this.last();
          } else if (this.firstRow <= 0) {
            this.first();
          }
          this.allSelected = this.rowsPerPage >= this.totalRows;
        }),
        catchError((error: any) => {
          console.error("Error running view query:", error);
          this.error =
            error.error || "An error occurred while querying the view.";
          this.rows = [];
          this.totalRows = 0;
          this.isLoading = false;
          return of([]);
        }),
      )
      .subscribe();
  }

  onWhereClauseChange(event: KeyboardEvent): void {
    if (event.key === "Enter") {
      this.queryView();
    }
  }

  next(): void {
    this.firstRow = Math.min(
      this.firstRow + this.rowsPerPage,
      Math.max(0, this.totalRows - this.rowsPerPage),
    );
  }

  previous(): void {
    this.firstRow = Math.max(0, this.firstRow - this.rowsPerPage);
  }

  first(): void {
    this.firstRow = 0;
  }

  last(): void {
    this.firstRow = Math.max(0, this.totalRows - this.rowsPerPage);
  }

  onRowsPerPageChange(): void {
    this.allSelected = this.rowsPerPage >= this.totalRows;
  }

  onAutoRefreshChange(event: SelectChangeEvent): void {
    if (event.value.value === 0) {
      if (this.autoRefreshTimer) {
        clearInterval(this.autoRefreshTimer);
        this.autoRefreshTimer = undefined;
      }
      return;
    }

    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
    }

    this.autoRefreshTimer = window.setInterval(() => {
      this.queryView();
    }, event.value.value);

    this.queryView();
  }
}
