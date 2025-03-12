import { Component, inject, OnInit } from "@angular/core";
import { Store } from "@ngxs/store";
import { LoadSchema } from "./schema.actions";
import { MonacoEditorModule } from "ngx-monaco-editor-v2";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { SchemaState } from "./schema.state";
import { AsyncPipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import type { editor } from "monaco-editor";
import { map } from "rxjs";

@Component({
  selector: "app-schema",
  imports: [MonacoEditorModule, ProgressSpinnerModule, AsyncPipe, FormsModule],
  templateUrl: "./schema.component.html",
  styleUrl: "./schema.component.scss",
})
export class SchemaComponent implements OnInit {
  private readonly store = inject(Store);

  isLoading$ = this.store.select(SchemaState.selectIsLoading);
  schema$ = this.store
    .select(SchemaState.selectSchema)
    .pipe(map((e) => JSON.stringify(e, null, 2)));

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
}
