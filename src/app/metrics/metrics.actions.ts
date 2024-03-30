export class SetRangeAction {
  static readonly type = '[Metrics] Set Range';
  constructor(public range: number) {}
}
