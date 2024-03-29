import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { FetchLogsAction, SetLogsFilter } from '../app.actions';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LogsState } from './logs.state';

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
  logs$ = this.store.select(LogsState.logs).pipe();

  ngOnInit(): void {
    this.store.dispatch(new FetchLogsAction());
    interval(1000)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() => this.store.dispatch(new FetchLogsAction())),
      )
      .subscribe();
  }

  setLogsFilter(ev: KeyboardEvent) {
    this.store.dispatch(
      new SetLogsFilter((ev.target as HTMLInputElement).value),
    );
  }
}
