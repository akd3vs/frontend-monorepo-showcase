/**
 * Standard error response returned by mock API handlers.
 */
export interface MockErrorResponse {
  error: {
    /** HTTP status code */
    code: number;
    /** Human-readable error message */
    message: string;
    /** Unique request identifier for tracing */
    requestId: string;
  };
}
