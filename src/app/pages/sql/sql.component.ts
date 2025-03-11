import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { Store } from "@ngxs/store";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TableModule } from "primeng/table";
import { RunSqlQuery } from "./sql.actions";
import { SqlState } from "./sql.state";
import { map } from "rxjs";
import { MonacoEditorModule } from "ngx-monaco-editor-v2";
import { FormsModule } from "@angular/forms";
import type { editor } from "monaco-editor";

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
  selector: "app-sql",
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    TableModule,
    MonacoEditorModule,
    FormsModule,
  ],
  templateUrl: "./sql.component.html",
  styleUrl: "./sql.component.scss",
})
export class SqlComponent {
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
  query = "SELECT * FROM star_systems";

  queryInfo$ = this.store.select(SqlState.selectQueryDetails);
  data$ = this.store.select(SqlState.selectData).pipe(
    map((data) => ({
      ...data,
      columns: data.columns.map((e) => ({
        name: e.name.some,
        type: algebraicTypeToColumn(e.algebraic_type),
      })),
    })),
  );

  runQuery() {
    this.store.dispatch(new RunSqlQuery(this.query));
  }
}
