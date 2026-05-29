/** NestJS validation / HTTP error body shape */
export interface ApiErrorBody {
  message: string | string[];
  statusCode?: number;
  error?: string;
}
