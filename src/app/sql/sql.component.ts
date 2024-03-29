import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { Store } from '@ngxs/store';
import { LoadTablesAction, RunQueryAction } from './sql.actions';
import { MatListModule } from '@angular/material/list';
import { SqlState } from './sql.state';
import { CommonModule } from '@angular/common';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { FormsModule } from '@angular/forms';
import type { editor } from 'monaco-editor';
import { MatTableModule } from '@angular/material/table';
import { map } from 'rxjs';
import { DataSource } from '@angular/cdk/collections';

@Component({
  selector: 'app-sql',
  standalone: true,
  imports: [
    CommonModule,
    MonacoEditorModule,
    FormsModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatTableModule,
  ],
  templateUrl: './sql.component.html',
  styleUrl: './sql.component.scss',
})
export class SqlComponent implements OnInit {
  private readonly store = inject(Store);

  protected tables$ = this.store.select(SqlState.tables);
  protected editorOptions: editor.IStandaloneEditorConstructionOptions = {
    theme: 'vs-dark',
    language: 'sql',
    automaticLayout: true,
    minimap: {
      enabled: false,
    },
  };
  protected query = 'SELECT * FROM StarSystem';
  protected responseDetails$ = this.store.select(SqlState.responseDetails);
  protected error$ = this.store.select(SqlState.error);
  protected results$ = this.store.select(SqlState.results).pipe();

  ngOnInit(): void {
    this.store.dispatch(new LoadTablesAction());
  }

  runQuery() {
    this.store.dispatch(new RunQueryAction(this.query));
  }
}
