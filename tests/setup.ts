/**
 * Test setup for @ninots/http.
 *
 * @packageDocumentation
 */

/**
 * Creates a mock Request object for testing.
 *
 * @param url - The request URL
 * @param options - Request options
 * @returns A new Request object
 */
export function createMockRequest(url: string, options: RequestInit = {}): Request {
    const fullUrl = url.startsWith("http") ? url : `http://localhost${url}`;
    return new Request(fullUrl, options);
}

/**
 * Creates a mock JSON Request for testing.
 *
 * @param url - The request URL
 * @param body - The JSON body
 * @param options - Additional request options
 * @returns A new Request object with JSON body
 */
export function createJsonRequest(url: string, body: Record<string, unknown>, options: RequestInit = {}): Request {
    const fullUrl = url.startsWith("http") ? url : `http://localhost${url}`;
    return new Request(fullUrl, {
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
        method: "POST",
        ...options,
    });
}
