import { Action, Selector, State, StateContext } from '@ngxs/store';
import { LoadTablesAction, RunQueryAction } from './sql.actions';
import { Injectable, inject } from '@angular/core';
import { ApiService } from '../api.service';
import { catchError, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

export interface SqlStateModel {
  tables: string[];
  responseDetails: {
    count: number;
    duration: number;
  };
  results: { rows: any[]; columns: string[] } | null;
  error: string | null;
}

@State<SqlStateModel>({
  name: 'sqlState',
  defaults: {
    tables: [],
    responseDetails: { count: 0, duration: 0 },
    results: null,
    error: null,
  },
})
@Injectable()
export class SqlState {
  private readonly apiService = inject(ApiService);

  @Selector()
  static tables(state: SqlStateModel) {
    return state.tables;
  }

  @Selector()
  static responseDetails(state: SqlStateModel) {
    return state.responseDetails;
  }

  @Selector()
  static results(state: SqlStateModel) {
    return state.results;
  }

  @Selector()
  static error(state: SqlStateModel) {
    return state.error;
  }

  @Action(LoadTablesAction)
  loadTables(ctx: StateContext<SqlStateModel>) {
    return this.apiService.getSchema().pipe(
      tap((schema) => {
        ctx.patchState({
          tables: Object.entries(schema.entities).reduce<string[]>(
            (acc, [key, value]) => {
              if (value.type === 'table') acc.push(key);
              return acc;
            },
            [],
          ),
        });
      }),
    );
  }

  @Action(RunQueryAction)
  runQuery(ctx: StateContext<SqlStateModel>, action: RunQueryAction) {
    const start = Date.now();
    return this.apiService.runQuery(action.query).pipe(
      tap((result) => {
        if (!result) return;

        const columns = result.schema.elements.map((e) => e.name.some);
        const rows = result.rows.map((row) =>
          row.reduce((acc, value, index) => {
            acc[columns[index]] = value;
            return acc;
          }, {}),
        );

        ctx.patchState({
          responseDetails: {
            count: result.rows.length,
            duration: Date.now() - start,
          },
          error: null,
          results: {
            rows,
            columns,
          },
        });
      }),
      catchError((err: HttpErrorResponse) => {
        ctx.patchState({
          responseDetails: {
            count: 0,
            duration: Date.now() - start,
          },
          error: err.error,
          results: null,
        });
        return [];
      }),
    );
  }
}
