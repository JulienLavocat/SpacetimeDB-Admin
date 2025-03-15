import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AppState } from "../app.state";
import { Store } from "@ngxs/store";
import { tap } from "rxjs";
import { MessageService } from "primeng/api";

export const dbNotSetGuard: CanActivateFn = () => {
  const router = inject(Router);
  const toast = inject(MessageService);
  return inject(Store)
    .select(AppState.selectHasCredentialsSet)
    .pipe(
      tap((allowed) => {
        if (!allowed) {
          toast.add({
            severity: "error",
            summary: "Database connection information missing",
            detail:
              "Please set your database connection information in the settings",
          });
          router.navigate(["settings"]);
        }
      }),
    );
};
