import { ApiClientError } from "@nice-land/api-client";

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export function getValidationFieldMessage(
  error: unknown,
  fieldLabels: Record<string, string>,
  fallback: string,
) {
  if (
    error instanceof ApiClientError &&
    error.payload?.details &&
    typeof error.payload.details === "object" &&
    "fieldErrors" in error.payload.details &&
    error.payload.details.fieldErrors &&
    typeof error.payload.details.fieldErrors === "object"
  ) {
    const details = error.payload.details as {
      fieldErrors: Record<string, string[] | undefined>;
    };
    const fieldMessages = Object.entries(details.fieldErrors)
      .flatMap(([field, messages]) =>
        (messages ?? []).map(
          (message) => `${fieldLabels[field] ?? field}: ${message}`,
        ),
      );

    if (fieldMessages.length > 0) {
      return `Dữ liệu chưa hợp lệ: ${fieldMessages.join("; ")}`;
    }
  }

  return getErrorMessage(error, fallback);
}
