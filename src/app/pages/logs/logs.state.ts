import { Action, Selector, State, StateContext } from "@ngxs/store";
import { LogLine } from "../../api.service";
import { append, insertItem, patch } from "@ngxs/store/operators";
import { inject, Injectable } from "@angular/core";
import { FilterService } from "primeng/api";

export class AppendLogLine {
  static type = "[Logs] Append Line";
  constructor(public line: LogLine) {}
}

export class SetSelectedLogLevels {
  static type = "[Logs] Set Selected Levels";
  constructor(public selectedLevels: string[]) {}
}

export class SetLogsFilter {
  static type = "[Logs] Set Logs Filter";
  constructor(public filter: string) {}
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
    ctx.setState(patch({ lines: insertItem(action.line) }));
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
}
