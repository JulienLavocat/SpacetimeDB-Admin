import { LowerCasePipe, NgClass } from "@angular/common";
import { Component, Input } from "@angular/core";
import { StdbTypes } from "../../../api";

@Component({
  selector: "app-reducer-param",
  imports: [NgClass, LowerCasePipe],
  templateUrl: "./reducer-param.component.html",
  styleUrl: "./reducer-param.component.scss",
})
export class ReducerParamComponent {
  @Input("type") type!: StdbTypes;
  @Input("name") name!: string;
  @Input("subType") subType!: StdbTypes | null;
  @Input("last") last!: boolean;
}
