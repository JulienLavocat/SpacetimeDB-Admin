import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { append, insertItem, patch } from "@ngxs/store/operators";
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

export class ClearLogs {
  static type = "[Logs] Clear logs";
}

export interface LogsStateModel {
  lines: LogLine[];
  selectedLogLevels: Set<string>;
  filter: string;
}

@State<LogsStateModel>({
  name: "logs",
  defaults: {
    lines: [],
    selectedLogLevels: new Set([
      "trace",
      "debug",
      "info",
      "warn",
      "error",
      "panic",
    ]),
    filter: "",
  },
})
@Injectable()
export class LogsState {
  @Selector()
  static selectLines(state: LogsStateModel) {
    return state.lines
      .filter((l) => state.selectedLogLevels.has(l.level))
      .filter((l) => l.message.includes(state.filter));
  }

  @Action(AppendLogLine)
  appendLogLine(ctx: StateContext<LogsStateModel>, action: AppendLogLine) {
    ctx.setState(patch({ lines: append(action.line) }));
  }

  @Action(SetSelectedLogLevels)
  setSelectedLogLevels(
    ctx: StateContext<LogsStateModel>,
    action: SetSelectedLogLevels,
  ) {
    ctx.patchState({ selectedLogLevels: new Set(action.selectedLevels) });
  }

  @Action(SetLogsFilter)
  setLogsFilter(ctx: StateContext<LogsStateModel>, action: SetLogsFilter) {
    ctx.patchState({ filter: action.filter });
  }

  @Action(ClearLogs)
  clearLogs(ctx: StateContext<LogsStateModel>) {
    ctx.patchState({ lines: [] });
  }
}
