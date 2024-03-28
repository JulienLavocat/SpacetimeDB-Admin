import { Component, inject } from '@angular/core';
import {
  Form,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Store } from '@ngxs/store';
import { SetDatabaseAction } from '../app.actions';
import { MatButtonModule } from '@angular/material/button';
import { combineLatest, map } from 'rxjs';
import { AppState } from '../app.state';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-set-database',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './set-database.component.html',
  styleUrl: './set-database.component.scss',
})
export class SetDatabaseComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  protected form$ = combineLatest([
    this.store.select(AppState.database),
    this.store.select(AppState.token),
  ]).pipe(
    map(([db, token]) =>
      this.fb.group({
        name: [db, Validators.required],
        token: [token, Validators.required],
      }),
    ),
  );

  onSubmit(form: FormGroup) {
    const values = form.value;
    if (!values.name || !values.token) return;
    this.store.dispatch(new SetDatabaseAction(values.name, values.token));
  }
}
