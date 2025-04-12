import { AsyncPipe } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Store } from "@ngxs/store";
import type { editor } from "monaco-editor";
import { MonacoEditorModule } from "ngx-monaco-editor-v2";
import { AccordionModule } from "primeng/accordion";
import { DividerModule } from "primeng/divider";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { RawModuleRef9 } from "../../api/raw-types";
import { LoadSchema } from "./schema.actions";
import { SchemaState } from "./schema.state";
import { TableComponent } from "./table/table.component";
import { map } from "rxjs";

@Component({
  selector: "app-schema",
  imports: [
    MonacoEditorModule,
    ProgressSpinnerModule,
    AsyncPipe,
    FormsModule,
    AccordionModule,
    DividerModule,
    TableComponent,
  ],
  templateUrl: "./schema.component.html",
  styleUrl: "./schema.component.css",
})
export class SchemaComponent implements OnInit {
  private readonly store = inject(Store);

  isLoading$ = this.store.select(SchemaState.selectIsLoading);
  schema$ = this.store.select(SchemaState.selectSchema).pipe(
    map((schema) => {
      schema?.tables.sort((a, b) => a.name.localeCompare(b.name));
      return schema;
    }),
  );

  editorOptions: editor.IStandaloneEditorConstructionOptions = {
    theme: "vs-dark",
    language: "json",
    automaticLayout: true,
    minimap: {
      enabled: true,
    },
  };

  ngOnInit(): void {
    this.store.dispatch(new LoadSchema());
  }

  getRawSchema(schema: RawModuleRef9) {
    return JSON.stringify(schema, null, 2);
  }
}
