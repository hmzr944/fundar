/** Errors carrying an HTTP status and a message safe to show to the user. */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code: string = "error",
  ) {
    super(message);
  }
}

export const notFound = (what = "Ressource") => new AppError(404, `${what} introuvable.`, "not_found");
export const badRequest = (message: string) => new AppError(400, message, "bad_request");
export const conflict = (message: string) => new AppError(409, message, "conflict");
export const unauthorized = () => new AppError(401, "Vous devez être connecté.", "unauthorized");
export const tooMany = (message: string) => new AppError(429, message, "rate_limited");
export const unavailable = (message: string) => new AppError(503, message, "unavailable");
