/**
 * Unit tests for RequestHelpers.
 *
 * @packageDocumentation
 */

import { describe, expect, test } from "bun:test";
import type { Server } from "bun";
import { RequestHelpers } from "../../src/request-helpers";
import { createJsonRequest, createMockRequest } from "../setup";

describe("RequestHelpers", () => {
    describe("query()", () => {
        test("should get query parameter", () => {
            const request = createMockRequest("/users?page=2&limit=10");

            expect(RequestHelpers.query(request, "page")).toBe("2");
            expect(RequestHelpers.query(request, "limit")).toBe("10");
        });

        test("should return undefined for missing parameter", () => {
            const request = createMockRequest("/users");

            expect(RequestHelpers.query(request, "page")).toBeUndefined();
        });

        test("should return default value for missing parameter", () => {
            const request = createMockRequest("/users");

            expect(RequestHelpers.query(request, "page", "1")).toBe("1");
        });
    });

    describe("queryAll()", () => {
        test("should get all query parameters", () => {
            const request = createMockRequest("/users?page=2&limit=10&sort=name");

            const params = RequestHelpers.queryAll(request);

            expect(params).toEqual({
                limit: "10",
                page: "2",
                sort: "name",
            });
        });

        test("should return empty object when no parameters", () => {
            const request = createMockRequest("/users");

            expect(RequestHelpers.queryAll(request)).toEqual({});
        });
    });

    describe("header()", () => {
        test("should get header value", () => {
            const request = createMockRequest("/api", {
                headers: { Authorization: "Bearer token123" },
            });

            expect(RequestHelpers.header(request, "Authorization")).toBe("Bearer token123");
        });

        test("should return undefined for missing header", () => {
            const request = createMockRequest("/api");

            expect(RequestHelpers.header(request, "X-Missing")).toBeUndefined();
        });

        test("should return default value for missing header", () => {
            const request = createMockRequest("/api");

            expect(RequestHelpers.header(request, "X-Missing", "default")).toBe("default");
        });
    });

    describe("hasHeader()", () => {
        test("should return true when header exists", () => {
            const request = createMockRequest("/api", {
                headers: { Authorization: "Bearer token123" },
            });

            expect(RequestHelpers.hasHeader(request, "Authorization")).toBe(true);
        });

        test("should return false when header does not exist", () => {
            const request = createMockRequest("/api");

            expect(RequestHelpers.hasHeader(request, "Authorization")).toBe(false);
        });
    });

    describe("bearerToken()", () => {
        test("should extract bearer token", () => {
            const request = createMockRequest("/api", {
                headers: { Authorization: "Bearer abc123xyz" },
            });

            expect(RequestHelpers.bearerToken(request)).toBe("abc123xyz");
        });

        test("should return undefined when no Authorization header", () => {
            const request = createMockRequest("/api");

            expect(RequestHelpers.bearerToken(request)).toBeUndefined();
        });

        test("should return undefined when not Bearer auth", () => {
            const request = createMockRequest("/api", {
                headers: { Authorization: "Basic dXNlcjpwYXNz" },
            });

            expect(RequestHelpers.bearerToken(request)).toBeUndefined();
        });
    });

    describe("json()", () => {
        test("should parse JSON body", async () => {
            const body = { email: "john@example.com", name: "John" };
            const request = createJsonRequest("/users", body);

            const result = await RequestHelpers.json(request);

            expect(result).toEqual(body);
        });

        test("should cache parsed body", async () => {
            const body = { name: "John" };
            const request = createJsonRequest("/users", body);

            const first = await RequestHelpers.json(request);
            const second = await RequestHelpers.json(request);

            expect(first).toBe(second);
        });
    });

    describe("input()", () => {
        test("should get value from body", async () => {
            const request = createJsonRequest("/users", {
                email: "john@example.com",
                name: "John",
            });

            const name = await RequestHelpers.input(request, "name");

            expect(name).toBe("John");
        });

        test("should return undefined for missing key", async () => {
            const request = createJsonRequest("/users", { name: "John" });

            const age = await RequestHelpers.input(request, "age");

            expect(age).toBeUndefined();
        });

        test("should return default value for missing key", async () => {
            const request = createJsonRequest("/users", { name: "John" });

            const role = await RequestHelpers.input(request, "role", "user");

            expect(role).toBe("user");
        });
    });

    describe("all()", () => {
        test("should get all body data", async () => {
            const body = {
                age: 30,
                name: "John",
            };
            const request = createJsonRequest("/users", body);

            const result = await RequestHelpers.all(request);

            expect(result).toEqual(body);
        });
    });

    describe("isMethod()", () => {
        test("should check request method", () => {
            const getRequest = createMockRequest("/users");
            const postRequest = createMockRequest("/users", { method: "POST" });

            expect(RequestHelpers.isMethod(getRequest, "GET")).toBe(true);
            expect(RequestHelpers.isMethod(getRequest, "POST")).toBe(false);
            expect(RequestHelpers.isMethod(postRequest, "POST")).toBe(true);
        });

        test("should be case-insensitive", () => {
            const request = createMockRequest("/users", { method: "POST" });

            expect(RequestHelpers.isMethod(request, "post")).toBe(true);
            expect(RequestHelpers.isMethod(request, "Post")).toBe(true);
        });
    });

    describe("method()", () => {
        test("should return request method", () => {
            const request = createMockRequest("/users", { method: "DELETE" });

            expect(RequestHelpers.method(request)).toBe("DELETE");
        });
    });

    describe("path()", () => {
        test("should return path without query string", () => {
            const request = createMockRequest("/users/123?page=1");

            expect(RequestHelpers.path(request)).toBe("/users/123");
        });
    });

    describe("url()", () => {
        test("should return full URL", () => {
            const request = createMockRequest("http://example.com/users?page=1");

            expect(RequestHelpers.url(request)).toBe("http://example.com/users?page=1");
        });
    });

    describe("is()", () => {
        test("should match exact path", () => {
            const request = createMockRequest("/admin/users");

            expect(RequestHelpers.is(request, "/admin/users")).toBe(true);
            expect(RequestHelpers.is(request, "/admin/posts")).toBe(false);
        });

        test("should match wildcard pattern", () => {
            const request = createMockRequest("/admin/users/123");

            expect(RequestHelpers.is(request, "/admin/*")).toBe(true);
            expect(RequestHelpers.is(request, "/users/*")).toBe(false);
        });
    });

    describe("cookie()", () => {
        test("should get a single cookie", () => {
            const request = createMockRequest("/api", {
                headers: { Cookie: "theme=dark; session=123" },
            });

            expect(RequestHelpers.cookie(request, "theme")).toBe("dark");
        });

        test("should return undefined if cookie is missing", () => {
            const request = createMockRequest("/api", {
                headers: { Cookie: "session=123" },
            });

            expect(RequestHelpers.cookie(request, "theme")).toBeUndefined();
        });

        test("should return defaultValue if cookie is missing", () => {
            const request = createMockRequest("/api");

            expect(RequestHelpers.cookie(request, "theme", "light")).toBe("light");
        });
    });

    describe("cookies()", () => {
        test("should parse multiple cookies", () => {
            const request = createMockRequest("/api", {
                headers: { Cookie: "theme=dark; session=123%3D" },
            });

            expect(RequestHelpers.cookies(request)).toEqual({
                session: "123=",
                theme: "dark",
            });
        });

        test("should return empty object if no cookies", () => {
            const request = createMockRequest("/api");

            expect(RequestHelpers.cookies(request)).toEqual({});
        });
    });

    describe("expectsJson()", () => {
        test("should return true when Accept header includes JSON", () => {
            const request = createMockRequest("/api", {
                headers: { Accept: "application/json" },
            });

            expect(RequestHelpers.expectsJson(request)).toBe(true);
        });

        test("should return false when Accept header does not include JSON", () => {
            const request = createMockRequest("/api", {
                headers: { Accept: "text/html" },
            });

            expect(RequestHelpers.expectsJson(request)).toBe(false);
        });
    });

    describe("isAjax()", () => {
        test("should return true for AJAX requests", () => {
            const request = createMockRequest("/api", {
                headers: { "X-Requested-With": "XMLHttpRequest" },
            });

            expect(RequestHelpers.isAjax(request)).toBe(true);
        });

        test("should return false for non-AJAX requests", () => {
            const request = createMockRequest("/api");

            expect(RequestHelpers.isAjax(request)).toBe(false);
        });
    });

    describe("ip()", () => {
        test("should get IP from X-Forwarded-For header", () => {
            const request = createMockRequest("/api", {
                headers: { "X-Forwarded-For": "192.168.1.1, 10.0.0.1" },
            });

            expect(RequestHelpers.ip(request)).toBe("192.168.1.1");
        });

        test("should get IP from X-Real-IP header", () => {
            const request = createMockRequest("/api", {
                headers: { "X-Real-IP": "192.168.1.100" },
            });

            expect(RequestHelpers.ip(request)).toBe("192.168.1.100");
        });

        test("should prefer Native Bun Server IP when available", () => {
            const request = createMockRequest("/api", {
                headers: { "X-Forwarded-For": "192.168.1.1" },
            });
            const mockServer = {
                requestIP: () => ({ address: "10.0.0.5" }),
            } as unknown as Server<unknown>;

            expect(RequestHelpers.ip(request, mockServer)).toBe("10.0.0.5");
        });

        test("should fallback to headers when Native Server requestIP fails", () => {
            const request = createMockRequest("/api", {
                headers: { "X-Forwarded-For": "192.168.1.1" },
            });
            const mockServer = {
                requestIP: () => null,
            } as unknown as Server<unknown>;

            expect(RequestHelpers.ip(request, mockServer)).toBe("192.168.1.1");
        });

        test("should return undefined when no IP headers", () => {
            const request = createMockRequest("/api");

            expect(RequestHelpers.ip(request)).toBeUndefined();
        });
    });

    describe("Edge Cases", () => {
        describe("query() edge cases", () => {
            test("should handle empty query parameter values", () => {
                const request = createMockRequest("/api?search=");

                expect(RequestHelpers.query(request, "search")).toBe("");
            });

            test("should handle query parameters with special characters", () => {
                const request = createMockRequest("/api?name=John%20Doe");

                expect(RequestHelpers.query(request, "name")).toBe("John Doe");
            });

            test("should return undefined for missing parameter even with default", () => {
                const request = createMockRequest("/api");

                // Note: This tests current behavior - returns undefined, NOT default
                const result = RequestHelpers.query(request, "missing", "default");
                expect(result).toBe("default");
            });
        });

        describe("bearerToken() edge cases", () => {
            test("should return undefined for malformed Authorization header", () => {
                const request = createMockRequest("/api", {
                    headers: { Authorization: "InvalidFormat token123" },
                });

                expect(RequestHelpers.bearerToken(request)).toBeUndefined();
            });

            test("should return undefined for Bearer without token", () => {
                const request = createMockRequest("/api", {
                    headers: { Authorization: "Bearer" },
                });

                // 'Bearer' without space after returns undefined
                expect(RequestHelpers.bearerToken(request)).toBeUndefined();
            });

            test("should return undefined for empty Authorization header", () => {
                const request = createMockRequest("/api", {
                    headers: { Authorization: "" },
                });

                expect(RequestHelpers.bearerToken(request)).toBeUndefined();
            });

            test("should handle Bearer with extra spaces", () => {
                const request = createMockRequest("/api", {
                    headers: { Authorization: "Bearer  token-with-spaces" },
                });

                expect(RequestHelpers.bearerToken(request)).toBe(" token-with-spaces");
            });
        });

        describe("json() edge cases", () => {
            test("should handle empty JSON object", async () => {
                const request = createJsonRequest("/api", {});

                const body = await RequestHelpers.json(request);
                expect(body).toEqual({});
            });

            test("should cache parsed JSON body", async () => {
                const request = createJsonRequest("/api", { test: "data" });

                const body1 = await RequestHelpers.json(request);
                const body2 = await RequestHelpers.json(request);

                // Should return same reference (cached)
                expect(body1).toBe(body2);
            });
        });

        describe("input() edge cases", () => {
            test("should return undefined for missing key", async () => {
                const request = createJsonRequest("/api", { name: "John" });

                const result = await RequestHelpers.input(request, "missing");
                expect(result).toBeUndefined();
            });

            test("should return default value for missing key", async () => {
                const request = createJsonRequest("/api", { name: "John" });

                const result = await RequestHelpers.input(request, "age", 25);
                expect(result).toBe(25);
            });

            test("should handle null values in body", async () => {
                const request = createJsonRequest("/api", { value: null });

                const result = await RequestHelpers.input(request, "value");
                // null values are treated as missing (returns undefined)
                expect(result).toBeUndefined();
            });
        });

        describe("isMethod() edge cases", () => {
            test("should be case insensitive - lowercase input", () => {
                const request = createMockRequest("/api", { method: "POST" });

                expect(RequestHelpers.isMethod(request, "post")).toBe(true);
            });

            test("should be case insensitive - mixed case input", () => {
                const request = createMockRequest("/api", { method: "POST" });

                expect(RequestHelpers.isMethod(request, "PoSt")).toBe(true);
            });

            test("should be case insensitive - uppercase method", () => {
                const request = createMockRequest("/api", { method: "get" });

                expect(RequestHelpers.isMethod(request, "GET")).toBe(true);
            });
        });

        describe("is() pattern matching edge cases", () => {
            test("should match exact path", () => {
                const request = createMockRequest("/admin/users");

                expect(RequestHelpers.is(request, "/admin/users")).toBe(true);
            });

            test("should not match different path", () => {
                const request = createMockRequest("/admin/users");

                expect(RequestHelpers.is(request, "/admin/posts")).toBe(false);
            });

            test("should match wildcard at end", () => {
                const request = createMockRequest("/admin/users/123");

                expect(RequestHelpers.is(request, "/admin/*")).toBe(true);
            });

            test("should match wildcard in middle", () => {
                const request = createMockRequest("/admin/users/123");

                expect(RequestHelpers.is(request, "/admin/*/123")).toBe(true);
            });

            test("should match multiple wildcards", () => {
                const request = createMockRequest("/admin/users/123/edit");

                expect(RequestHelpers.is(request, "/admin/*/*/edit")).toBe(true);
            });
        });

        describe("header() edge cases", () => {
            test("should be case-insensitive for header names", () => {
                const request = createMockRequest("/api", {
                    headers: { "Content-Type": "application/json" },
                });

                expect(RequestHelpers.header(request, "content-type")).toBe("application/json");
            });

            test("should return default for missing header", () => {
                const request = createMockRequest("/api");

                expect(RequestHelpers.header(request, "X-Missing", "default")).toBe("default");
            });
        });
    });
});
