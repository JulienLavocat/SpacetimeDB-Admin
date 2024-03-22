export class AppInitAction {
  public static type = '[AppState] Init';
}

export class FetchLogsAction {
  public static type = '[AppState] Fetch Logs';
}

export class SetLogsFilter {
  public static type = '[AppState] Set Logs Filter';

  constructor(public filter: string) {}
}
