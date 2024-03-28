import { MatToolbar, MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Component, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { AppState } from '../../app.state';
import { CommonModule } from '@angular/common';
import { combineLatest, map } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-app-bar',
  standalone: true,
  imports: [
    MatToolbarModule,
    CommonModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './app-bar.component.html',
  styleUrl: './app-bar.component.scss',
})
export class AppBarComponent {
  store = inject(Store);

  infos$ = combineLatest([
    this.store.select(AppState.infos),
    this.store.select(AppState.database),
  ]).pipe(map(([infos, name]) => ({ ...infos, name })));
}
