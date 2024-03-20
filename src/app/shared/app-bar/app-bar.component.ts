import { MatToolbar, MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Component, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { AppState } from '../../app.state';
import { CommonModule } from '@angular/common';
import { combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-app-bar',
  standalone: true,
  imports: [MatToolbarModule, CommonModule, MatInputModule, MatIconModule],
  templateUrl: './app-bar.component.html',
  styleUrl: './app-bar.component.scss',
})
export class AppBarComponent {
  store = inject(Store);

  infos$ = combineLatest([
    this.store.select(AppState.infos),
    this.store.select(AppState.dbName),
  ]).pipe(map(([infos, name]) => ({ ...infos, name })));
}
