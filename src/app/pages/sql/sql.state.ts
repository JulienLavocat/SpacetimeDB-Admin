import { inject, Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { catchError, tap, throwError } from "rxjs";
import { ApiService, SqlQueryResult } from "../../api.service";
import { RunSqlQuery } from "./sql.actions";

export interface SqlStateModel {
  rowsCount: number;
  queryTime: number;
  rows: unknown[];
  isLoading: boolean;
  error: string;
  columns: SqlQueryResult["schema"]["elements"];
}
@State<SqlStateModel>({
  name: "sql",
  defaults: {
    isLoading: false,
    rowsCount: 0,
    queryTime: 0,
    rows: [],
    columns: [],
    error: "",
  },
})
@Injectable()
export class SqlState {
  private readonly api = inject(ApiService);

  @Selector()
  static selectQueryDetails(state: SqlStateModel) {
    return {
      rowsCount: state.rowsCount,
      queryTime: state.queryTime,
      isLoading: state.isLoading,
    };
  }

  @Selector()
  static selectData(state: SqlStateModel) {
    return { rows: state.rows, columns: state.columns, error: state.error };
  }

  @Action(RunSqlQuery)
  runSqlQuery(ctx: StateContext<SqlStateModel>, action: RunSqlQuery) {
    ctx.patchState({
      isLoading: true,
    });
    const startDate = Date.now();
    return this.api.runQuery(action.query).pipe(
      tap((results) => {
        const data = results[0];
        const queryTime = Date.now() - startDate;
        const columns = data.schema.elements;
        console.log(data);
        ctx.patchState({
          isLoading: false,
          queryTime,
          error: "",
          columns,
          rowsCount: data.rows.length,
          rows: data.rows.map((row) =>
            row.reduce((acc, next, nextIndex) => {
              acc[columns[nextIndex].name.some] = next;
              return acc;
            }, {}),
          ),
        });
      }),
      catchError((err) => {
        ctx.patchState({
          isLoading: false,
          queryTime: Date.now() - startDate,
          rowsCount: 0,
          error: err.error,
        });
        return throwError(() => err);
      }),
    );
  }
}
