import { LowerCasePipe, NgClass } from "@angular/common";
import { Component, Input } from "@angular/core";
import { ReducerParam } from "../../../api";

@Component({
  selector: "app-reducer-param",
  imports: [NgClass, LowerCasePipe],
  templateUrl: "./reducer-param.component.html",
})
export class ReducerParamComponent {
  @Input("param") param!: ReducerParam;
  @Input("last") last!: boolean;
}
