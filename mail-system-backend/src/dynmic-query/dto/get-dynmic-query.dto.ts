export class GetTableDataDto {
  table!: string;
  columns?: string[];
  limit?: number;
  offset?: number;
}
