export class LoadTablesAction {
  static readonly type = '[SQL] Load Tabkes';
}

export class RunQueryAction {
  static readonly type = '[SQL] Run Query';

  constructor(public query: string) {}
}
