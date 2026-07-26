/**
 * Strict type definitions for HTTP package with explicit typing.
 *
 * @packageDocumentation
 */

/**
 * Branded type for HTTP status codes (100-599).
 * Provides compile-time type safety for valid HTTP status codes.
 *
 * @example
 * ```typescript
 * const status: HttpStatusCode = 200; // Error - must use createHttpStatusCode
 * const status = createHttpStatusCode(200); // OK
 * const status = HttpStatus.OK; // OK
 * ```
 */
export type HttpStatusCode = number & { readonly __brand: "HttpStatusCode" };

/**
 * Create a type-safe HTTP status code with runtime validation.
 *
 * @param code - The numeric status code (100-599)
 * @returns A branded HttpStatusCode
 * @throws {RangeError} If code is outside valid range (100-599)
 *
 * @example
 * ```typescript
 * const ok = createHttpStatusCode(200); // HttpStatusCode
 * const invalid = createHttpStatusCode(999); // throws RangeError
 * ```
 */
export function createHttpStatusCode(code: number): HttpStatusCode {
    if (!isValidHttpStatusCode(code)) {
        throw new RangeError(`Invalid HTTP status code: ${code}. Must be between 100 and 599.`);
    }
    return code as HttpStatusCode;
}

/**
 * HTTP method literal union type for type-safe method checking.
 *
 * Includes all standard HTTP methods defined in RFC 7231 and RFC 5789.
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS" | "CONNECT" | "TRACE";

/**
 * HTTP redirect status codes.
 *
 * - 301: Moved Permanently - Resource permanently moved
 * - 302: Found - Temporary redirect (originally "Moved Temporarily")
 * - 303: See Other - Response is at another URI using GET
 * - 307: Temporary Redirect - Temporary redirect preserving method
 * - 308: Permanent Redirect - Permanent redirect preserving method
 */
export type RedirectStatusCode = 301 | 302 | 303 | 307 | 308;

/**
 * Content-Disposition type for file responses.
 *
 * - inline: Display file in browser
 * - attachment: Force download
 */
export type ContentDisposition = "inline" | "attachment";

/**
 * Options for JSON responses with strict type safety.
 */
export interface JsonResponseOptions {
    /**
     * HTTP status code.
     * @defaultValue 200
     */
    readonly status?: number;

    /**
     * Additional headers to include in the response.
     * Headers are immutable once set.
     */
    readonly headers?: Readonly<Record<string, string>>;
}

/**
 * Options for redirect responses with strict redirect status codes.
 */
export interface RedirectResponseOptions {
    /**
     * HTTP redirect status code.
     *
     * @defaultValue 302 (temporary redirect)
     */
    readonly status?: RedirectStatusCode;

    /**
     * Additional headers to include in the response.
     */
    readonly headers?: Readonly<Record<string, string>>;
}

/**
 * Options for HTML responses.
 */
export interface HtmlResponseOptions {
    /**
     * HTTP status code.
     * @defaultValue 200
     */
    readonly status?: number;

    /**
     * Additional headers to include in the response.
     */
    readonly headers?: Readonly<Record<string, string>>;
}

/**
 * Options for plain text responses.
 */
export interface TextResponseOptions {
    /**
     * HTTP status code.
     * @defaultValue 200
     */
    readonly status?: number;

    /**
     * Additional headers to include in the response.
     */
    readonly headers?: Readonly<Record<string, string>>;
}

/**
 * Options for file responses using Bun's native file handling.
 */
export interface FileResponseOptions {
    /**
     * The filename to use for Content-Disposition header.
     * If not specified, uses the file's original name.
     */
    readonly filename?: string;

    /**
     * Whether to force download (attachment) or display inline.
     * @defaultValue false (inline)
     */
    readonly download?: boolean;

    /**
     * Additional headers to include in the response.
     * Note: Content-Type is automatically inferred by Bun from file extension.
     */
    readonly headers?: Readonly<Record<string, string>>;
}

/**
 * Type guard to check if a string is a valid HTTP method.
 *
 * @param method - The string to check
 * @returns True if the string is a valid HTTP method
 *
 * @example
 * ```typescript
 * if (isHttpMethod(userInput)) {
 *     // userInput is HttpMethod
 * }
 * ```
 */
export function isHttpMethod(method: string): method is HttpMethod {
    const validMethods: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS", "CONNECT", "TRACE"];
    return validMethods.includes(method.toUpperCase() as HttpMethod);
}

/**
 * Type guard to check if a number is a valid HTTP status code.
 *
 * @param code - The number to check
 * @returns True if the number is in the valid HTTP status code range (100-599)
 *
 * @example
 * ```typescript
 * if (isValidHttpStatusCode(statusCode)) {
 *     // statusCode can be safely cast to HttpStatusCode
 * }
 * ```
 */
export function isValidHttpStatusCode(code: number): code is HttpStatusCode {
    return Number.isInteger(code) && code >= 100 && code <= 599;
}

/**
 * Type guard to check if a status code is a redirect status.
 *
 * @param code - The status code to check
 * @returns True if the code is a redirect status (301, 302, 303, 307, 308)
 *
 * @example
 * ```typescript
 * if (isRedirectStatus(response.status)) {
 *     // Handle redirect
 * }
 * ```
 */
export function isRedirectStatus(code: number): code is RedirectStatusCode {
    const redirectCodes: RedirectStatusCode[] = [301, 302, 303, 307, 308];
    return redirectCodes.includes(code as RedirectStatusCode);
}

/**
 * Common HTTP status codes as branded constants.
 *
 * Provides type-safe access to standard HTTP status codes without
 * needing to call `createHttpStatusCode()`.
 *
 * @example
 * ```typescript
 * ResponseHelpers.json(data, { status: HttpStatus.OK });
 * ResponseHelpers.json(error, { status: HttpStatus.NOT_FOUND });
 * ```
 */
export const HttpStatus = {
    /** 202 Accepted - Request accepted for processing */
    ACCEPTED: 202 as HttpStatusCode,
    /** 502 Bad Gateway - Invalid upstream response */
    BAD_GATEWAY: 502 as HttpStatusCode,

    // 4xx Client Errors
    /** 400 Bad Request - Invalid client request */
    BAD_REQUEST: 400 as HttpStatusCode,
    /** 409 Conflict - Request conflicts with current state */
    CONFLICT: 409 as HttpStatusCode,
    /** 201 Created - Resource created successfully */
    CREATED: 201 as HttpStatusCode,
    /** 403 Forbidden - Server refuses to authorize */
    FORBIDDEN: 403 as HttpStatusCode,
    /** 302 Found - Temporary redirect */
    FOUND: 302 as HttpStatusCode,
    /** 504 Gateway Timeout - Upstream server timeout */
    GATEWAY_TIMEOUT: 504 as HttpStatusCode,
    /** 410 Gone - Resource permanently deleted */
    GONE: 410 as HttpStatusCode,

    // 5xx Server Errors
    /** 500 Internal Server Error - Generic server error */
    INTERNAL_SERVER_ERROR: 500 as HttpStatusCode,
    /** 405 Method Not Allowed - Method not supported */
    METHOD_NOT_ALLOWED: 405 as HttpStatusCode,

    // 3xx Redirection
    /** 301 Moved Permanently - Resource permanently moved */
    MOVED_PERMANENTLY: 301 as HttpStatusCode,
    /** 204 No Content - Success with no response body */
    NO_CONTENT: 204 as HttpStatusCode,
    /** 406 Not Acceptable - Cannot produce acceptable response */
    NOT_ACCEPTABLE: 406 as HttpStatusCode,
    /** 404 Not Found - Resource not found */
    NOT_FOUND: 404 as HttpStatusCode,
    /** 501 Not Implemented - Method not implemented */
    NOT_IMPLEMENTED: 501 as HttpStatusCode,
    /** 304 Not Modified - Resource hasn't been modified */
    NOT_MODIFIED: 304 as HttpStatusCode,
    // 2xx Success
    /** 200 OK - Standard successful response */
    OK: 200 as HttpStatusCode,
    /** 402 Payment Required - Reserved for future use */
    PAYMENT_REQUIRED: 402 as HttpStatusCode,
    /** 308 Permanent Redirect - Permanent redirect preserving method */
    PERMANENT_REDIRECT: 308 as HttpStatusCode,
    /** 408 Request Timeout - Client took too long */
    REQUEST_TIMEOUT: 408 as HttpStatusCode,
    /** 303 See Other - Response at another URI using GET */
    SEE_OTHER: 303 as HttpStatusCode,
    /** 503 Service Unavailable - Server temporarily unavailable */
    SERVICE_UNAVAILABLE: 503 as HttpStatusCode,
    /** 307 Temporary Redirect - Temporary redirect preserving method */
    TEMPORARY_REDIRECT: 307 as HttpStatusCode,
    /** 429 Too Many Requests - Rate limit exceeded */
    TOO_MANY_REQUESTS: 429 as HttpStatusCode,
    /** 401 Unauthorized - Authentication required */
    UNAUTHORIZED: 401 as HttpStatusCode,
    /** 422 Unprocessable Entity - Validation failed */
    UNPROCESSABLE_ENTITY: 422 as HttpStatusCode,
    /** 415 Unsupported Media Type - Media type not supported */
    UNSUPPORTED_MEDIA_TYPE: 415 as HttpStatusCode,
} as const;
