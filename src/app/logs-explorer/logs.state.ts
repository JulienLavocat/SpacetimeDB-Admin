import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { FetchLogsAction, SetLogsFilter } from '../app.actions';
import { AppState } from '../app.state';
import { Injectable, inject } from '@angular/core';
import { ApiService, LogLine } from '../api.service';
import { tap } from 'rxjs';

interface LogsStateModel {
  logs: LogLine[];
  filter: string;
  matchers: [string, string][];
}

const levelInfos: Record<string, string> = {
  Trace: 'info',
  Debug: 'info',
  Info: 'info',
  Warn: 'warning',
  Error: 'error',
  Panic: 'error',
};

@State({ name: 'logsState', defaults: { logs: [], filter: '', matchers: [] } })
@Injectable()
export class LogsState {
  private readonly api = inject(ApiService);
  private readonly store = inject(Store);

  @Selector()
  static logs(state: LogsStateModel) {
    return LogsState.filterLogs(state)
      .map<Omit<LogLine, 'ts' | 'line_number'> & { ts: string; icon: string }>(
        (l) => {
          return {
            level: l.level.toLowerCase(),
            ts: new Date(l.ts / 1000).toISOString(),
            filename: `${l.filename}${l.filename !== 'spacetimedb' ? ':' + l.line_number : ''}`,
            icon: levelInfos[l.level],
            message: l.message,
          };
        },
      )
      .reverse();
  }

  @Action(FetchLogsAction)
  fetchLogs(ctx: StateContext<LogsStateModel>) {
    return this.api
      .getLogs(
        this.store.selectSnapshot(AppState.database),
        this.store.selectSnapshot(AppState.token),
      )
      .pipe(
        tap((logs) => {
          ctx.patchState({ logs });
        }),
      );
  }

  @Action(SetLogsFilter)
  SetLogsFilter(ctx: StateContext<LogsStateModel>, action: SetLogsFilter) {
    const parts = action.filter.split(' ');

    let messageMatch = '';
    const matchers: [string, string][] = parts.reduce<[string, string][]>(
      (acc, current) => {
        if (!current) return acc;

        if (current.startsWith('file=') || current.startsWith('level=')) {
          acc.push(current.split('=') as [string, string]);
          if (messageMatch) {
            acc.push(['message', messageMatch.trim()]);
            messageMatch = '';
          }
        } else {
          messageMatch += current + ' ';
        }
        return acc;
      },
      [],
    );
    if (messageMatch) matchers.push(['message', messageMatch.trim()]);
    ctx.patchState({ filter: action.filter, matchers });
  }

  static filterLogs(state: LogsStateModel): LogLine[] {
    const matchers = state.matchers;
    if (matchers.length === 0) return state.logs;

    return state.logs.filter((line) => {
      return matchers.every(([on, value]) => {
        switch (on) {
          case 'file':
            return line.filename.toLowerCase().includes(value.toLowerCase());
          case 'level':
            return line.level.toLowerCase().includes(value.toLowerCase());

          case 'message':
            return line.message.toLowerCase().includes(value.toLowerCase());

          default:
            return false;
        }
      });
    });
  }
}
