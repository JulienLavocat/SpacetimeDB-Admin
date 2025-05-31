import { Component, inject, input, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { ButtonModule } from "primeng/button";
import { TableModule } from "primeng/table";
import { ApiService, Table } from "../../../api";
import { DividerModule } from "primeng/divider";
import { catchError, of, take, tap } from "rxjs";
import { MessageModule } from "primeng/message";
import { SelectChangeEvent, SelectModule } from "primeng/select";

@Component({
  selector: "app-explorer-tab",
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
  ],
  templateUrl: "./explorer-tab.component.html",
  styleUrl: "./explorer-tab.component.scss",
})
export class ExplorerTabComponent implements OnInit, OnDestroy {
  private readonly apiService = inject(ApiService);

  readonly table = input.required<Table>();

  isLoading: boolean = true;
  whereClause: string = "";
  rows: any[] = [];
  totalRows: number = 0;
  tableColumns!: string[];
  error?: string;

  // Paginator
  firstRow: number = 0;
  rowsPerPage: number = 25;
  availableRows: number[] = [10, 25, 50, 100, 1000];
  allSelected: boolean = false;

  // Auto refresh
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
    this.tableColumns = this.table().columns.map((e) => e.name);
    this.queryTable();
  }

  ngOnDestroy(): void {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
      this.autoRefreshTimer = undefined;
    }
  }

  queryTable(): void {
    let query = `SELECT * FROM ${this.table().name}`;
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
          this.rows = result.rows;
          this.totalRows = result.rows.length;
          this.isLoading = false;
          this.firstRow = 0;
          this.allSelected = this.rowsPerPage >= this.totalRows;
        }),
        catchError((error: any) => {
          console.error("Error running query:", error);
          this.error =
            error.error || "An error occurred while running the query.";
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
      this.queryTable();
    }
  }

  next(): void {
    this.firstRow = Math.min(
      this.firstRow + this.rowsPerPage,
      this.totalRows - this.rowsPerPage,
    );
  }

  previous(): void {
    this.firstRow = Math.max(0, this.firstRow - this.rowsPerPage);
  }

  first(): void {
    this.firstRow = 0;
  }

  last(): void {
    this.firstRow = this.totalRows - this.rowsPerPage;
  }

  onRowsPerPageChange(): void {
    console.log("Rows per page changed to:", this.rowsPerPage);
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
      this.queryTable();
    }, event.value.value);

    this.queryTable();
  }
}
