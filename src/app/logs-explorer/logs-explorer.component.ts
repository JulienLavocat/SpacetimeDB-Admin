import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { FetchLogsAction } from '../app.actions';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, map, switchMap } from 'rxjs';
import { AppState } from '../app.state';
import { CommonModule } from '@angular/common';
import { LogLine } from '../api.service';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

const levelInfos: Record<string, string> = {
  Trace: 'info',
  Debug: 'info',
  Info: 'info',
  Warn: 'warning',
  Error: 'error',
  Panic: 'error',
};

@Component({
  selector: 'app-logs-explorer',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatFormFieldModule, MatInputModule],
  templateUrl: './logs-explorer.component.html',
  styleUrl: './logs-explorer.component.scss',
})
export class LogsExplorerComponent implements OnInit {
  private store = inject(Store);
  private destroyRef = inject(DestroyRef);
  logs$ = this.store.select(AppState.logs).pipe(
    map((logs) =>
      logs
        .map<
          Omit<LogLine, 'ts' | 'line_number'> & { ts: string; icon: string }
        >((l) => {
          return {
            level: l.level.toLowerCase(),
            ts: new Date(l.ts / 1000).toISOString(),
            filename: `${l.filename}${l.filename !== 'spacetimedb' ? ':' + l.line_number : ''}`,
            icon: levelInfos[l.level],
            message: l.message,
          };
        })
        .reverse(),
    ),
  );

  ngOnInit(): void {
    interval(1000)
      .pipe(
        // take(1),
        takeUntilDestroyed(this.destroyRef),
        switchMap(() => this.store.dispatch(new FetchLogsAction())),
      )
      .subscribe();
  }
}
