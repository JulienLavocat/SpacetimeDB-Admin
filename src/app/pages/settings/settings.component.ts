import { Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabelModule } from "primeng/floatlabel";
import { CardModule } from "primeng/card";
import { Store } from "@ngxs/store";
import { SetDatabaseInfo, TestDatabaseConnectionAction } from "../../app.state";
import { MessageService } from "primeng/api";
import { take, tap } from "rxjs";

@Component({
  selector: "app-settings",
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    FloatLabelModule,
    CardModule,
  ],
  templateUrl: "./settings.component.html",
  styleUrl: "./settings.component.scss",
})
export class SettingsComponent {
  form = inject(FormBuilder).group({
    token: ["", Validators.required],
    instanceUrl: ["", Validators.required],
    database: ["", Validators.required],
  });

  private readonly store = inject(Store);
  private readonly toast = inject(MessageService);

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
