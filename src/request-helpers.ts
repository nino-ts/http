/**
 * Request helper functions for working with HTTP requests.
 *
 * @packageDocumentation
 */

/**
 * Helper functions for working with HTTP requests.
 *
 * These are static methods that work with native Request objects,
 * providing a Laravel-like API for common operations.
 *
 * @example
 * ```typescript
 * const name = RequestHelpers.input(request, 'name');
 * const page = RequestHelpers.query(request, 'page', '1');
 * const body = await RequestHelpers.json(request);
 * ```
 */
/**
 * Cache for parsed request bodies.
 * Uses WeakMap to avoid memory leaks.
 */
import type { Server } from "bun";

const bodyCache = new WeakMap<Request, Record<string, unknown>>();

/** @internal */
export interface RequestHelpersType {
    all(request: Request): Promise<Record<string, unknown>>;
    bearerToken(request: Request): string | undefined;
    cookie(request: Request, name: string, defaultValue?: string): string | undefined;
    cookies(request: Request): Record<string, string>;
    expectsJson(request: Request): boolean;
    hasHeader(request: Request, name: string): boolean;
    header(request: Request, name: string, defaultValue?: string): string | undefined;
    input<T = unknown>(request: Request, key: string, defaultValue?: T): Promise<T | undefined>;
    ip(request: Request, server?: Server<unknown>): string | undefined;
    is(request: Request, pattern: string): boolean;
    isAjax(request: Request): boolean;
    isMethod(request: Request, method: string): boolean;
    json<T = Record<string, unknown>>(request: Request): Promise<T>;
    method(request: Request): string;
    path(request: Request): string;
    query(request: Request, key: string, defaultValue?: string): string | undefined;
    queryAll(request: Request): Record<string, string>;
    url(request: Request): string;
}

export const RequestHelpers: RequestHelpersType = {
    /**
     * Get all input from the request body.
     *
     * @param request - The request object
     * @returns The full request body
     */
    async all(request: Request): Promise<Record<string, unknown>> {
        return RequestHelpers.json(request);
    },
    /**
     * Get the bearer token from the Authorization header.
     *
     * @param request - The request object
     * @returns The bearer token or undefined
     *
     * @example
     * ```typescript
     * // Header: Authorization: Bearer abc123
     * const token = RequestHelpers.bearerToken(request); // 'abc123'
     * ```
     */
    bearerToken(request: Request): string | undefined {
        const auth = request.headers.get("Authorization");
        if (!auth?.startsWith("Bearer ")) {
            return undefined;
        }
        return auth.slice(7);
    },
    /**
     * Get a cookie from the request headers.
     *
     * @param request - The request object
     * @param name - The cookie name
     * @param defaultValue - Default value if cookie not found
     * @returns The cookie value or defaultValue
     */
    cookie(request: Request, name: string, defaultValue?: string): string | undefined {
        return RequestHelpers.cookies(request)[name] ?? defaultValue;
    },
    /**
     * Get all cookies from the request headers mapped as specific entries natively processing elements.
     *
     * @param request - The request object
     * @returns All cookies mapping properly generated internal loops
     */
    cookies(request: Request): Record<string, string> {
        const cookieHeader = request.headers.get("Cookie");
        if (!cookieHeader) {
            return {};
        }

        return Object.fromEntries(
            cookieHeader.split(";").map((c) => {
                const [k, v] = c.split("=");
                return [k?.trim() ?? "", decodeURIComponent(v?.trim() ?? "")];
            }),
        );
    },
    /**
     * Check if the request expects a JSON response.
     *
     * @param request - The request object
     * @returns True if the request accepts JSON
     */
    expectsJson(request: Request): boolean {
        const accept = request.headers.get("Accept") ?? "";
        return accept.includes("application/json");
    },
    /**
     * Check if the request has a specific header.
     *
     * @param request - The request object
     * @param name - The header name
     * @returns True if the header exists
     */
    hasHeader(request: Request, name: string): boolean {
        return request.headers.has(name);
    },
    /**
     * Get a header value from the request.
     *
     * @param request - The request object
     * @param name - The header name
     * @param defaultValue - Default value if header not found
     * @returns The header value
     *
     * @example
     * ```typescript
     * const token = RequestHelpers.header(request, 'Authorization');
     * const contentType = RequestHelpers.header(request, 'Content-Type', 'application/json');
     * ```
     */
    header(request: Request, name: string, defaultValue?: string): string | undefined {
        return request.headers.get(name) ?? defaultValue;
    },
    /**
     * Get a value from the request body (for JSON requests).
     *
     * @param request - The request object
     * @param key - The key to retrieve
     * @param defaultValue - Default value if key not found
     * @returns The value from the body
     *
     * @example
     * ```typescript
     * const name = await RequestHelpers.input(request, 'name');
     * const role = await RequestHelpers.input(request, 'role', 'user');
     * ```
     */
    async input<T = unknown>(request: Request, key: string, defaultValue?: T): Promise<T | undefined> {
        const body = await RequestHelpers.json(request);
        const value = (body as Record<string, unknown>)[key];
        return (value as T) ?? defaultValue;
    },
    /**
     * Get the client IP address.
     *
     * @param request - The request object
     * @param server - The native Bun server instance (for native IP extraction)
     * @returns The client IP address or undefined
     */
    ip(request: Request, server?: Server<unknown>): string | undefined {
        if (server) {
            const clientIP = server.requestIP(request);
            if (clientIP?.address) {
                return clientIP.address;
            }
        }
        return (
            request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ??
            request.headers.get("X-Real-IP") ??
            undefined
        );
    },
    /**
     * Check if the request path matches a pattern.
     *
     * @param request - The request object
     * @param pattern - The pattern to match (supports * wildcard)
     * @returns True if the path matches
     *
     * @example
     * ```typescript
     * // URL: /admin/users/123
     * RequestHelpers.is(request, '/admin/*'); // true
     * RequestHelpers.is(request, '/users/*'); // false
     * ```
     */
    is(request: Request, pattern: string): boolean {
        const path = RequestHelpers.path(request);
        const regex = new RegExp(`^${pattern.replace(/\*/g, ".*").replace(/\//g, "\\/")}$`);
        return regex.test(path);
    },
    /**
     * Check if the request is an AJAX request.
     *
     * @param request - The request object
     * @returns True if the request is AJAX
     */
    isAjax(request: Request): boolean {
        return request.headers.get("X-Requested-With") === "XMLHttpRequest";
    },
    /**
     * Check if the request method matches.
     *
     * @param request - The request object
     * @param method - The method to check (case-insensitive)
     * @returns True if the method matches
     *
     * @example
     * ```typescript
     * if (RequestHelpers.isMethod(request, 'POST')) {
     *   // Handle POST request
     * }
     * ```
     */
    isMethod(request: Request, method: string): boolean {
        return request.method.toUpperCase() === method.toUpperCase();
    },
    /**
     * Parse and return the JSON body of the request.
     *
     * @param request - The request object
     * @returns The parsed JSON body
     *
     * @example
     * ```typescript
     * const body = await RequestHelpers.json<{ name: string }>(request);
     * console.log(body.name);
     * ```
     */
    async json<T = Record<string, unknown>>(request: Request): Promise<T> {
        const cached = bodyCache.get(request) as T | undefined;
        if (cached) {
            return cached;
        }

        const body = (await request.json()) as T;
        bodyCache.set(request, body as Record<string, unknown>);
        return body;
    },
    /**
     * Get the request method.
     *
     * @param request - The request object
     * @returns The HTTP method
     */
    method(request: Request): string {
        return request.method;
    },
    /**
     * Get the request path (without query string).
     *
     * @param request - The request object
     * @returns The request path
     *
     * @example
     * ```typescript
     * // URL: https://example.com/users/123?page=1
     * const path = RequestHelpers.path(request); // '/users/123'
     * ```
     */
    path(request: Request): string {
        return new URL(request.url).pathname;
    },
    /**
     * Get a value from the query string.
     *
     * @param request - The request object
     * @param key - The query parameter key
     * @param defaultValue - Default value if key not found
     * @returns The query parameter value
     *
     * @example
     * ```typescript
     * // URL: /users?page=2&limit=10
     * const page = RequestHelpers.query(request, 'page'); // '2'
     * const sort = RequestHelpers.query(request, 'sort', 'name'); // 'name'
     * ```
     */
    query(request: Request, key: string, defaultValue?: string): string | undefined {
        const url = new URL(request.url);
        return url.searchParams.get(key) ?? defaultValue;
    },
    /**
     * Get all query string parameters.
     *
     * @param request - The request object
     * @returns Object containing all query parameters
     *
     * @example
     * ```typescript
     * // URL: /users?page=2&limit=10
     * const params = RequestHelpers.queryAll(request);
     * // { page: '2', limit: '10' }
     * ```
     */
    queryAll(request: Request): Record<string, string> {
        const url = new URL(request.url);
        const params: Record<string, string> = {};

        url.searchParams.forEach((value, key) => {
            params[key] = value;
        });

        return params;
    },
    /**
     * Get the full URL of the request.
     *
     * @param request - The request object
     * @returns The full URL
     */
    url(request: Request): string {
        return request.url;
    },
};
