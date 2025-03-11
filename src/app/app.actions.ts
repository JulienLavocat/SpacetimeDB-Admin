export class SetDatabaseInfo {
  static type = "[App] Set Database Info";

  constructor(
    public instanceUrl: string,
    public database: string,
    public token: string,
  ) {}
}
