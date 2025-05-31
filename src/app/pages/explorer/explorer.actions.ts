import { Table } from "../../api";

export class LoadExplorerSchema {
  static readonly type = "[Explorer] Load Schema";
}

export class OpenExplorerTable {
  static readonly type = "[Explorer] Select Table";

  constructor(public table: Table) {}
}

export class CloseExplorerTab {
  static readonly type = "[Explorer] Close Tab";

  constructor(public tabId: string) {}
}
