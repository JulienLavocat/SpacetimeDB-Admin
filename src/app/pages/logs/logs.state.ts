import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { append, patch } from "@ngxs/store/operators";
import { EMPTY } from "rxjs";
import { LogLine } from "../../api/types";

export class AppendLogLine {
  static type = "[Logs] Append Lines";
  constructor(public line: LogLine[]) {}
}

export class SetSelectedLogLevels {
  static type = "[Logs] Set Selected Levels";
  constructor(public selectedLevels: string[]) {}
}

export class SetLogsFilter {
  static type = "[Logs] Set Logs Filter";
  constructor(public filter: string) {}
}

export class SetFilesFilter {
  static type = "[Logs] Set Files filter";
  constructor(public filter: string) {}
}

export class ClearLogs {
  static type = "[Logs] Clear logs";
}

export interface LogsStateModel {
  lines: LogLine[];
  selectedLogLevels: Set<string>;
  filter: string;
  filesFilter: string;
}

const DEFAULT_SELECTED_LEVELS = new Set([
  "trace",
  "debug",
  "info",
  "warn",
  "error",
  "panic",
]);

@State<LogsStateModel>({
  name: "logs",
  defaults: {
    lines: [],
    selectedLogLevels: DEFAULT_SELECTED_LEVELS,
    filter: "",
    filesFilter: "",
  },
})
@Injectable()
export class LogsState {
  @Selector()
  static selectLines(state: LogsStateModel) {
    return state.lines
      .filter((l) => state.selectedLogLevels.has(l.level))
      .filter(
        (l) =>
          l.message.includes(state.filter) &&
          l.filename?.includes(state.filesFilter),
      );
  }

  @Action(AppendLogLine)
  appendLogLine(ctx: StateContext<LogsStateModel>, action: AppendLogLine) {
    ctx.setState(patch({ lines: append(action.line) }));
    return EMPTY;
  }

  @Action(SetSelectedLogLevels)
  setSelectedLogLevels(
    ctx: StateContext<LogsStateModel>,
    action: SetSelectedLogLevels,
  ) {
    ctx.patchState({ selectedLogLevels: new Set(action.selectedLevels) });
    return EMPTY;
  }

  @Action(SetLogsFilter)
  setLogsFilter(ctx: StateContext<LogsStateModel>, action: SetLogsFilter) {
    ctx.patchState({ filter: action.filter });
    return EMPTY;
  }

  @Action(SetFilesFilter)
  setFilesFilter(ctx: StateContext<LogsStateModel>, action: SetFilesFilter) {
    ctx.patchState({ filesFilter: action.filter });
    return EMPTY;
  }

  @Action(ClearLogs)
  clearLogs(ctx: StateContext<LogsStateModel>) {
    ctx.patchState({
      lines: [],
      filter: "",
      filesFilter: "",
      selectedLogLevels: DEFAULT_SELECTED_LEVELS,
    });
    return EMPTY;
  }
}
