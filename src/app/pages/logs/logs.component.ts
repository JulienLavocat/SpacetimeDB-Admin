import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { CardModule } from "primeng/card";
import { ScrollerModule } from "primeng/scroller";
import { tap } from "rxjs";
import { ApiService, LogLine } from "../../api.service";
import { ReverseIterablePipe } from "../../utils/reverse-iterable.pipe";
import { PrimeIcons } from "primeng/api";
import { NgClass } from "@angular/common";
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";

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
    ReverseIterablePipe,
    NgClass,
    InputGroupModule,
    InputGroupAddonModule,
  ],
  templateUrl: "./logs.component.html",
  styleUrl: "./logs.component.scss",
})
export class LogsComponent implements OnInit {
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);

  lines: LogLine[] = [];

  ngOnInit() {
    this.api
      .getLogs()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((line) => {
          this.lines.push(line);
          this.changeDetector.detectChanges();
        }),
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
}
