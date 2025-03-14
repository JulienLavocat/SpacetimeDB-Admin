export interface Table {
  name: string;
  columns: { name: string; type: string }[];
  primary_key: {};
}
