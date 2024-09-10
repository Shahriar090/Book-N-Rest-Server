type TApiError = {
  statusCode: number;
  data: any;
  message: string;
  success: boolean;
  errors: any[];
  stack?: string;
};

class ApiError extends Error implements TApiError {
  statusCode: number;
  data: any;
  success: boolean;
  errors: any[];
  stack?: string;

  constructor(
    statusCode: number,
    message: string = "Something Went Wrong",
    errors: any[] = [],
    stack?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;
    this.stack = stack;

    if (!stack) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
