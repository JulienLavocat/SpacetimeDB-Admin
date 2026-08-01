import { View } from "../../api";

export class LoadViewsSchema {
  static readonly type = "[Views] Load Schema";
}

export class FilterViews {
  static readonly type = "[Views] Filter";
  constructor(public filter: string) {}
}

export class OpenView {
  static readonly type = "[Views] Open View";
  constructor(public view: View) {}
}

export class CloseViewTab {
  static readonly type = "[Views] Close Tab";
  constructor(public tabId: string) {}
}
