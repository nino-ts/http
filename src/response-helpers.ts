/**
 * Response helper functions for creating HTTP responses.
 *
 * @packageDocumentation
 */

import type { BunFile } from "bun";
import type {
    FileResponseOptions,
    HtmlResponseOptions,
    JsonResponseOptions,
    RedirectResponseOptions,
    TextResponseOptions,
} from "./types";

/**
 * Helper functions for creating HTTP responses.
 *
 * These are static methods that work with native Response objects,
 * providing a Laravel-like API for common response types.
 *
 * @example
 * ```typescript
 * // JSON response
 * return ResponseHelpers.json({ user: 'John' });
 *
 * // Redirect
 * return ResponseHelpers.redirect('/login');
 *
 * // HTML
 * return ResponseHelpers.html('<h1>Hello</h1>');
 * ```
 */
/** @internal */
export interface ResponseHelpersType {
    badRequest(message?: string): Response;
    created<T>(data?: T, location?: string): Response;
    file(file: BunFile, options?: FileResponseOptions): Response;
    forbidden(message?: string): Response;
    html(html: string, options?: HtmlResponseOptions): Response;
    json<T>(body: T, options?: JsonResponseOptions): Response;
    noContent(): Response;
    notFound(message?: string): Response;
    redirect(url: string, options?: RedirectResponseOptions | number): Response;
    serverError(message?: string): Response;
    text(text: string, options?: TextResponseOptions): Response;
    unauthorized(message?: string): Response;
    unprocessableEntity(errors: Record<string, unknown>): Response;
}

export const ResponseHelpers: ResponseHelpersType = {
    /**
     * Create a 400 Bad Request response.
     *
     * @param message - Optional error message
     * @returns A JSON response with 400 status
     */
    badRequest(message = "Bad Request"): Response {
        return ResponseHelpers.json({ error: message }, { status: 400 });
    },
    /**
     * Create a 201 Created response.
     *
     * @param data - Optional data to include in response
     * @param location - Optional Location header for the created resource
     * @returns A JSON response with 201 status
     */
    created<T>(data?: T, location?: string): Response {
        const headers: Record<string, string> = {};
        if (location) {
            headers.Location = location;
        }

        return ResponseHelpers.json(data ?? { success: true }, {
            headers,
            status: 201,
        });
    },
    /**
     * Create a file response.
     *
     * @param file - A Bun file object (from Bun.file())
     * @param options - Response options (filename, download, headers)
     * @returns A Response object serving the file
     *
     * @example
     * ```typescript
     * ResponseHelpers.file(Bun.file('./document.pdf'));
     * ResponseHelpers.file(Bun.file('./image.png'), { download: true, filename: 'photo.png' });
     * ```
     */
    file(file: BunFile, options: FileResponseOptions = {}): Response {
        const { filename, download = false, headers = {} } = options;

        const responseHeaders: Record<string, string> = { ...headers };

        if (download || filename) {
            let name = filename;
            if (!name && file.name) {
                // Extract filename from full path
                name = file.name.split(/[\\/]/).pop() ?? "download";
            }
            name = name ?? "download";
            const disposition = download ? "attachment" : "inline";
            responseHeaders["Content-Disposition"] = `${disposition}; filename="${name}"`;
        }

        return new Response(file, {
            headers: responseHeaders,
        });
    },
    /**
     * Create a 403 Forbidden response.
     *
     * @param message - Optional error message
     * @returns A JSON response with 403 status
     */
    forbidden(message = "Forbidden"): Response {
        return ResponseHelpers.json({ error: message }, { status: 403 });
    },
    /**
     * Create an HTML response.
     *
     * @param html - The HTML content
     * @param options - Response options (status, headers)
     * @returns A Response object with HTML content-type
     *
     * @example
     * ```typescript
     * ResponseHelpers.html('<h1>Welcome</h1>');
     * ResponseHelpers.html('<h1>Not Found</h1>', { status: 404 });
     * ```
     */
    html(html: string, options: HtmlResponseOptions = {}): Response {
        const { status = 200, headers = {} } = options;

        return new Response(html, {
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                ...headers,
            },
            status,
        });
    },
    /**
     * Create a JSON response.
     *
     * @param data - The data to serialize as JSON
     * @param options - Response options (status, headers)
     * @returns A Response object with JSON content-type
     *
     * @example
     * ```typescript
     * ResponseHelpers.json({ users: [] });
     * ResponseHelpers.json({ error: 'Not found' }, { status: 404 });
     * ```
     */
    json<T>(data: T, options: JsonResponseOptions = {}): Response {
        const { status = 200, headers = {} } = options;

        return Response.json(data, {
            headers: {
                ...headers, // Bun's Response.json auto-appends application/json, keeping overrides safe
            },
            status,
        });
    },
    /**
     * Create a 204 No Content response.
     *
     * @returns A Response with no body
     */
    noContent(): Response {
        return new Response(null, { status: 204 });
    },
    /**
     * Create a 404 Not Found response.
     *
     * @param message - Optional error message
     * @returns A JSON response with 404 status
     *
     * @example
     * ```typescript
     * ResponseHelpers.notFound();
     * ResponseHelpers.notFound('User not found');
     * ```
     */
    notFound(message = "Not Found"): Response {
        return ResponseHelpers.json({ error: message }, { status: 404 });
    },
    /**
     * Create a redirect response.
     *
     * @param url - The URL to redirect to
     * @param options - Response options (status, headers)
     * @returns A Response object with redirect headers
     *
     * @example
     * ```typescript
     * ResponseHelpers.redirect('/login');
     * ResponseHelpers.redirect('/dashboard', { status: 301 });
     * ```
     */
    redirect(url: string, options: RedirectResponseOptions = {}): Response {
        const { status = 302, headers = {} } = options;

        return new Response(null, {
            headers: {
                Location: url,
                ...headers,
            },
            status,
        });
    },
    /**
     * Create a 500 Internal Server Error response.
     *
     * @param message - Optional error message
     * @returns A JSON response with 500 status
     */
    serverError(message = "Internal Server Error"): Response {
        return ResponseHelpers.json({ error: message }, { status: 500 });
    },
    /**
     * Create a plain text response.
     *
     * @param text - The text content
     * @param options - Response options (status, headers)
     * @returns A Response object with text content-type
     *
     * @example
     * ```typescript
     * ResponseHelpers.text('Hello, World!');
     * ```
     */
    text(text: string, options: TextResponseOptions = {}): Response {
        const { status = 200, headers = {} } = options;

        return new Response(text, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                ...headers,
            },
            status,
        });
    },
    /**
     * Create a 401 Unauthorized response.
     *
     * @param message - Optional error message
     * @returns A JSON response with 401 status
     */
    unauthorized(message = "Unauthorized"): Response {
        return ResponseHelpers.json({ error: message }, { status: 401 });
    },
    /**
     * Create a 422 Unprocessable Entity response.
     *
     * @param errors - Validation errors
     * @returns A JSON response with 422 status
     */
    unprocessableEntity(errors: Record<string, unknown>): Response {
        return Response.json(
            {
                errors,
                message: "Unprocessable Entity",
            },
            { status: 422 },
        );
    },
};
