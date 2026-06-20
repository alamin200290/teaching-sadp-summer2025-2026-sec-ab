// A small error taxonomy. The application/domain layers throw these; the presentation
// layer (errorHandler middleware) maps them to HTTP status codes. This keeps HTTP concerns
// OUT of the domain (dependency direction: the domain knows nothing about HTTP).
export class AppError extends Error {
  constructor(
    message: string,
    public readonly httpStatus: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string) { super(message, 400, "VALIDATION"); }
}

export class NotFoundError extends AppError {
  constructor(message: string) { super(message, 404, "NOT_FOUND"); }
}

export class UnavailableError extends AppError {
  constructor(message: string) { super(message, 409, "UNAVAILABLE"); }
}
