import { AsyncPipe, NgClass } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Store } from "@ngxs/store";
import { PrimeIcons } from "primeng/api";
import { CardModule } from "primeng/card";
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { InputTextModule } from "primeng/inputtext";
import { MessageModule } from "primeng/message";
import { MultiSelectModule } from "primeng/multiselect";
import { ScrollerModule } from "primeng/scroller";
import { tap } from "rxjs";
import { ApiService } from "../../api/api.service";
import { LogsAccessError } from "../../api/logs-fetcher";
import {
  AppendLogLine,
  ClearLogs,
  LogsState,
  SetFilesFilter,
  SetLogsFilter,
  SetSelectedLogLevels,
} from "./logs.state";
import { ReverseIterablePipe } from "../../utils/reverse-iterable.pipe";
import { LogLine } from "../../api";

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
    MessageModule,
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
  accessError: string | null = null;

  ngOnInit() {
    const [events$, cancelSubscribption] = this.api.getLogs();
    this.cancelSubscribption = cancelSubscribption;
    events$
      .pipe(tap((line) => this.store.dispatch(new AppendLogLine(line))))
      .subscribe({
        error: (err) => {
          this.accessError = this.formatAccessError(err);
        },
      });
  }

  private formatAccessError(err: unknown): string {
    if (err instanceof LogsAccessError) {
      if (err.status === 401 || err.status === 403) {
        return "Owner only — viewing database logs requires the database owner's identity token. You can still use Explorer, SQL, Reducers, Views, and Schema with a non-owner or anonymous identity.";
      }
      return `Failed to load logs (HTTP ${err.status}): ${err.message}`;
    }
    if (err && typeof err === "object" && "message" in err) {
      return String((err as Error).message);
    }
    return "Failed to load logs. Viewing logs requires the database owner's token.";
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ClearLogs());
    if (this.cancelSubscribption) this.cancelSubscribption();
  }

  getLevelIcon(level: string) {
    return levelsIcons[level];
  }

  printFilename(line: LogLine) {
    if (!line.filename) return line.target ?? "unknown";
    if (line.filename === "spacetimedb") return "spacetimedb";
    if (line.filename === "external") return "external";
    return `${line.filename}:${line.line_number}`;
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
