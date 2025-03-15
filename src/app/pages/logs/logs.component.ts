import { AsyncPipe, NgClass } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Store } from "@ngxs/store";
import { PrimeIcons } from "primeng/api";
import { CardModule } from "primeng/card";
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { InputTextModule } from "primeng/inputtext";
import { MultiSelectModule } from "primeng/multiselect";
import { ScrollerModule } from "primeng/scroller";
import { repeat, tap } from "rxjs";
import { ApiService } from "../../api/api.service";
import {
  AppendLogLine,
  ClearLogs,
  LogsState,
  SetFilesFilter,
  SetLogsFilter,
  SetSelectedLogLevels,
} from "./logs.state";
import { ReverseIterablePipe } from "../../utils/reverse-iterable.pipe";

const levelsIcons: Record<string, string> = {
  trace: PrimeIcons.INFO_CIRCLE,
  debug: PrimeIcons.INFO_CIRCLE,
  info: PrimeIcons.INFO_CIRCLE,
  warn: PrimeIcons.EXCLAMATION_CIRCLE,
  error: PrimeIcons.EXCLAMATION_TRIANGLE,
  panic: PrimeIcons.EXCLAMATION_TRIANGLE,
};

@Component({
  selector: "app-logs",
  imports: [
    ScrollerModule,
    CardModule,
    NgClass,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    FormsModule,
    MultiSelectModule,
    AsyncPipe,
    ReverseIterablePipe,
  ],
  templateUrl: "./logs.component.html",
  styleUrl: "./logs.component.css",
})
export class LogsComponent implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly store = inject(Store);

  lines$ = this.store.select(LogsState.selectLines);
  levelsOptions = ["trace", "debug", "info", "warn", "error", "panic"];
  selectedLevels = this.levelsOptions;
  cancelSubscribption?: () => void;

  ngOnInit() {
    const [events$, cancelSubscribption] = this.api.getLogs();
    this.cancelSubscribption = cancelSubscribption;
    events$
      .pipe(
        repeat({ delay: 10 }),
        tap((line) => this.store.dispatch(new AppendLogLine(line))),
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ClearLogs());
    if (this.cancelSubscribption) this.cancelSubscribption();
  }

  getLevelIcon(level: string) {
    return levelsIcons[level];
  }

  printFilename(filename: string, lineNumber: number) {
    return filename === "spacetimedb"
      ? "spacetimedb"
      : `${filename}:${lineNumber}`;
  }

  filterLogs(event: Event) {
    const target = event.target as any;
    const value = target?.value;
    this.store.dispatch(new SetLogsFilter(value));
  }

  filterFiles(event: Event) {
    const target = event.target as any;
    const value = target?.value;
    this.store.dispatch(new SetFilesFilter(value));
  }

  filterLogLevels() {
    this.store.dispatch(new SetSelectedLogLevels(this.selectedLevels));
  }
}
