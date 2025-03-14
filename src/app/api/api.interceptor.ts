import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Store } from "@ngxs/store";
import { AppState } from "../app.state";

export const addTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);
  return next(
    req.clone({
      headers: req.headers.set(
        "Authorization",
        `Bearer ${store.selectSnapshot(AppState.selectToken)}`,
      ),
    }),
  );
};
