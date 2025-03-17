import { DecimalPipe, NgFor } from "@angular/common";
import { Component, inject, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Store } from "@ngxs/store";
import { editor } from "monaco-editor";
import { MonacoEditorModule } from "ngx-monaco-editor-v2";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TableModule } from "primeng/table";
import { catchError, take, tap, throwError } from "rxjs";
import { ApiService } from "../../../api";
import { SetSqlTabQuery } from "../sql.state";

const NUMERIC_TYPES = new Set([
  "I8",
  "U8",
  "I16",
  "U16",
  "I32",
  "U32",
  "I64",
  "U64",
  "I128",
  "U128",
  "F32",
  "F64",
]);

function algebraicTypeToColumn(type: any) {
  if (NUMERIC_TYPES.has(Object.keys(type)[0])) return "numeric";

  return "text";
}

@Component({
  selector: "app-query",
  imports: [
    NgFor,
    DecimalPipe,
    ButtonModule,
    CardModule,
    TableModule,
    MonacoEditorModule,
    FormsModule,
  ],
  templateUrl: "./query.component.html",
  styleUrl: "./query.component.css",
})
export class QueryComponent {
  @Input("id") id!: string;
  @Input("query") query = "";

  private readonly api = inject(ApiService);
  private readonly store = inject(Store);

  editorOptions: editor.IStandaloneEditorConstructionOptions = {
    theme: "vs-dark",
    language: "sql",
    automaticLayout: true,
    minimap: {
      enabled: false,
    },
    placeholder: "Enter your query",
  };

  queryTime = 0;
  rowsCount = 0;
  isLoading = false;
  error = "";
  columns: { name: string; type: string }[] = [];
  rows: unknown[] = [];

  runQuery() {
    const startDate = Date.now();
    this.isLoading = true;
    this.store.dispatch(new SetSqlTabQuery(this.id, this.query));
    this.api
      .runQuery(this.query)
      .pipe(
        take(1),
        tap((results) => {
          const data = results[0];
          const queryTime = Date.now() - startDate;
          const columns = data.schema.elements;

          this.isLoading = false;
          this.queryTime = queryTime;
          this.error = "";
          this.columns = columns.map((e) => ({
            name: e.name.some,
            type: algebraicTypeToColumn(e.algebraic_type),
          }));
          this.rowsCount = data.rows.length;
          this.rows = data.rows.map((row) =>
            row.reduce((acc, next, nextIndex) => {
              acc[columns[nextIndex].name.some] = next;
              return acc;
            }, {}),
          );
        }),
        catchError((err) => {
          this.isLoading = false;
          this.queryTime = Date.now() - startDate;
          this.rowsCount = 0;
          this.error = err.error;
          return throwError(() => err);
        }),
      )
      .subscribe();
  }
}
