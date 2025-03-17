import { Component, inject, Input } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { DynamicDialogRef } from "primeng/dynamicdialog";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputTextModule } from "primeng/inputtext";

@Component({
  selector: "app-rename-tab",
  imports: [FormsModule, InputTextModule, FloatLabelModule, ButtonModule],
  templateUrl: "./rename-tab.component.html",
  styleUrl: "./rename-tab.component.css",
})
export class RenameTabComponent {
  @Input("name") name!: string;

  private readonly dialogRef = inject(DynamicDialogRef);

  submit() {
    this.dialogRef.close(this.name);
  }
}
