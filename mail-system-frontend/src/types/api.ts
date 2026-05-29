import type { ApiErrorBody } from "@mail-system/shared";

export type { ApiErrorBody } from "@mail-system/shared";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: ApiErrorBody,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
