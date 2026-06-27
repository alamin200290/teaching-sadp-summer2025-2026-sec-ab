export class AppError extends Error {
  constructor(message: string, public readonly httpStatus: number, public readonly code: string) {
    super(message); this.name = new.target.name;
  }
}
export class ValidationError extends AppError { constructor(m: string) { super(m, 400, "VALIDATION"); } }
export class NotFoundError extends AppError { constructor(m: string) { super(m, 404, "NOT_FOUND"); } }
export class UnavailableError extends AppError { constructor(m: string) { super(m, 409, "UNAVAILABLE"); } }
