import { AsyncPipe, NgClass } from "@angular/common";
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { Store } from "@ngxs/store";
import { PrimeIcons } from "primeng/api";
import { CardModule } from "primeng/card";
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { InputTextModule } from "primeng/inputtext";
import { MultiSelectModule } from "primeng/multiselect";
import { ScrollerModule } from "primeng/scroller";
import { tap } from "rxjs";
import { ApiService } from "../../api.service";
import {
  AppendLogLine,
  LogsState,
  SetLogsFilter,
  SetSelectedLogLevels,
} from "./logs.state";

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
  ],
  templateUrl: "./logs.component.html",
  styleUrl: "./logs.component.css",
})
export class LogsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly store = inject(Store);

  lines$ = this.store.select(LogsState.selectLines);
  levelsOptions = ["trace", "debug", "info", "warn", "error", "panic"];
  selectedLevels = this.levelsOptions;

  ngOnInit() {
    this.api
      .getLogs()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((line) => this.store.dispatch(new AppendLogLine(line))),
      )
      .subscribe();
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

  filterLogLevels() {
    this.store.dispatch(new SetSelectedLogLevels(this.selectedLevels));
  }
}
