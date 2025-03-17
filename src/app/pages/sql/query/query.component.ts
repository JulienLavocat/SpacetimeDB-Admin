import { DecimalPipe, NgFor } from "@angular/common";
import { Component, inject, Input, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import * as editor from "monaco-editor";
import { MonacoEditorModule } from "ngx-monaco-editor-v2";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TableModule } from "primeng/table";
import { catchError, take, tap, throwError } from "rxjs";
import { ApiService } from "../../../api";
import { Store } from "@ngxs/store";
import { SqlState } from "../sql.state";

const LAST_QUERY = (tab: string) => `sql.last-query.${tab}`;

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

let existingCompletion: editor.IDisposable | null = null;

const KEYWORDS = [
  "SELECT",
  "INSERT",
  "DELETE",
  "UPDATE",
  "SET",
  "LIMIT",
  "COUNT",
  "INTO",
  "VALUES",
  "SHOW",
  "FROM",
  "WHERE",
  "JOIN",
  "ON",
  "INNER",
  "AS",
  "AND",
  "OR",
];

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
export class QueryComponent implements OnInit {
  @Input("id") id!: string;

  private readonly api = inject(ApiService);
  private readonly store = inject(Store);

  editorOptions: editor.editor.IStandaloneEditorConstructionOptions = {
    theme: "vs-dark",
    language: "sql",
    automaticLayout: true,
    minimap: {
      enabled: false,
    },
    placeholder: "Enter your query",
  };
  query = "";
  queryTime = 0;
  rowsCount = 0;
  isLoading = false;
  error = "";
  columns: { name: string; type: string }[] = [];
  rows: unknown[] = [];

  ngOnInit(): void {
    this.query = localStorage.getItem(LAST_QUERY(this.id)) ?? "";
  }

  onEditorReady() {
    const monaco: typeof editor = (window as any).monaco;

    if (existingCompletion) {
      existingCompletion.dispose();
    }

    const tables = this.store.selectSnapshot(SqlState.selectTables);

    existingCompletion = monaco.languages.registerCompletionItemProvider(
      "sql",
      {
        triggerCharacters: [" ", "."],
        provideCompletionItems(model, position, context, token) {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };
          const tablesSuggestions = tables.map((table) => ({
            label: table.name,
            insertText: table.name,
            kind: editor.languages.CompletionItemKind.Class,
            range,
          }));

          const keywordsSuggestions = KEYWORDS.map((kw) => ({
            label: kw,
            insertText: kw,
            kind: editor.languages.CompletionItemKind.Keyword,
            range,
          }));
          return {
            suggestions: [...tablesSuggestions, ...keywordsSuggestions],
          };
        },
      },
    );
  }

  runQuery() {
    localStorage.setItem(LAST_QUERY(this.id), this.query);
    const startDate = Date.now();
    this.isLoading = true;
    this.api
      .runQuery(this.query)
      .pipe(
        take(1),
        tap((results) => {
          const data = results[0];
          const queryTime = Date.now() - startDate;
          const columns = data.schema.elements;

          console.log(data);
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
