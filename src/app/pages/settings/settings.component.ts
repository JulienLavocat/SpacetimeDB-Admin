import { AsyncPipe } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Store } from "@ngxs/store";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputTextModule } from "primeng/inputtext";
import { take, tap } from "rxjs";
import {
  AppState,
  SetDatabaseInfo,
  TestDatabaseConnectionAction,
} from "../../app.state";

@Component({
  selector: "app-settings",
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    FloatLabelModule,
    CardModule,
    AsyncPipe,
  ],
  templateUrl: "./settings.component.html",
  styleUrl: "./settings.component.scss",
})
export class SettingsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly toast = inject(MessageService);

  form = this.fb.group({
    token: ["", Validators.required],
    instanceUrl: ["", Validators.required],
    database: ["", Validators.required],
  });

  form$ = this.store.select(AppState.selectDbInfos).pipe(
    tap((dbInfos) => {
      this.form.patchValue({
        token: dbInfos.token,
        instanceUrl: dbInfos.url,
        database: dbInfos.db,
      });
    }),
  );

  onSubmit() {
    console.log(this.form.valid);
    if (!this.form.valid) return;

    const values = this.form.value;
    this.store
      .dispatch(
        new SetDatabaseInfo(
          values.instanceUrl!,
          values.database!,
          values.token!,
          "",
        ),
      )
      .pipe(
        take(1),
        tap(() =>
          this.toast.add({
            severity: "success",
            summary: "Database connection settings saved",
          }),
        ),
      )
      .subscribe();
  }

  test() {
    const values = this.form.value;
    this.store.dispatch(
      new TestDatabaseConnectionAction(
        values.instanceUrl!,
        values.database!,
        values.token!,
      ),
    );
  }
}
