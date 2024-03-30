import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Store } from '@ngxs/store';
import { AppState } from '../app.state';
import { filter } from 'rxjs';

export const resolveDatabaseAddress: ResolveFn<string> = () => {
  return inject(Store).select(AppState.databaseAddress).pipe(filter(Boolean));
};
