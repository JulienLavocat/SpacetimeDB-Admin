import { Component, inject } from '@angular/core';
import { ApiService } from '../api.service';
import { CommonModule } from '@angular/common';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { MatCardModule } from '@angular/material/card';
import { editor } from 'monaco-editor';
import { map } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-schema',
  standalone: true,
  imports: [CommonModule, MonacoEditorModule, MatCardModule, FormsModule],
  templateUrl: './schema.component.html',
  styleUrl: './schema.component.scss',
})
export class SchemaComponent {
  protected readonly schema$ = inject(ApiService)
    .getSchema()
    .pipe(map((schema) => JSON.stringify(schema, null, 2)));
  protected editorOptions: editor.IStandaloneEditorConstructionOptions = {
    readOnly: true,
    language: 'json',
    theme: 'vs-dark',
  };
}
