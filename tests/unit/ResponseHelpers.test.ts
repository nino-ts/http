/**
 * Unit tests for ResponseHelpers.
 *
 * @packageDocumentation
 */

import { describe, expect, test } from "bun:test";
import { ResponseHelpers } from "../../src/response-helpers";

describe("ResponseHelpers", () => {
    describe("json()", () => {
        test("should create JSON response with default status 200", async () => {
            const data = { age: 30, name: "John" };
            const response = ResponseHelpers.json(data);

            expect(response.status).toBe(200);
            expect(response.headers.get("Content-Type")).toContain("application/json");

            const body = await response.json();
            expect(body).toEqual(data);
        });

        test("should create JSON response with custom status", async () => {
            const response = ResponseHelpers.json({ error: "Not found" }, { status: 404 });

            expect(response.status).toBe(404);
        });

        test("should include custom headers", async () => {
            const response = ResponseHelpers.json(
                {},
                {
                    headers: { "X-Custom": "value" },
                },
            );

            expect(response.headers.get("X-Custom")).toBe("value");
        });
    });

    describe("redirect()", () => {
        test("should create redirect response with default status 302", () => {
            const response = ResponseHelpers.redirect("/login");

            expect(response.status).toBe(302);
            expect(response.headers.get("Location")).toBe("/login");
        });

        test("should create redirect with custom status", () => {
            const response = ResponseHelpers.redirect("/new-url", { status: 301 });

            expect(response.status).toBe(301);
        });
    });

    describe("html()", () => {
        test("should create HTML response with default status 200", async () => {
            const html = "<h1>Hello World</h1>";
            const response = ResponseHelpers.html(html);

            expect(response.status).toBe(200);
            expect(response.headers.get("Content-Type")).toBe("text/html; charset=utf-8");

            const body = await response.text();
            expect(body).toBe(html);
        });

        test("should create HTML response with custom status", () => {
            const response = ResponseHelpers.html("<h1>Not Found</h1>", {
                status: 404,
            });

            expect(response.status).toBe(404);
        });
    });

    describe("text()", () => {
        test("should create text response", async () => {
            const text = "Hello, World!";
            const response = ResponseHelpers.text(text);

            expect(response.status).toBe(200);
            expect(response.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");

            const body = await response.text();
            expect(body).toBe(text);
        });
    });

    describe("notFound()", () => {
        test("should create 404 response with default message", async () => {
            const response = ResponseHelpers.notFound();

            expect(response.status).toBe(404);

            const body = await response.json();
            expect(body).toEqual({ error: "Not Found" });
        });

        test("should create 404 response with custom message", async () => {
            const response = ResponseHelpers.notFound("User not found");

            const body = await response.json();
            expect(body).toEqual({ error: "User not found" });
        });
    });

    describe("badRequest()", () => {
        test("should create 400 response", async () => {
            const response = ResponseHelpers.badRequest("Invalid data");

            expect(response.status).toBe(400);

            const body = await response.json();
            expect(body).toEqual({ error: "Invalid data" });
        });
    });

    describe("unauthorized()", () => {
        test("should create 401 response", async () => {
            const response = ResponseHelpers.unauthorized();

            expect(response.status).toBe(401);

            const body = await response.json();
            expect(body).toEqual({ error: "Unauthorized" });
        });
    });

    describe("forbidden()", () => {
        test("should create 403 response", async () => {
            const response = ResponseHelpers.forbidden();

            expect(response.status).toBe(403);

            const body = await response.json();
            expect(body).toEqual({ error: "Forbidden" });
        });
    });

    describe("serverError()", () => {
        test("should create 500 response", async () => {
            const response = ResponseHelpers.serverError();

            expect(response.status).toBe(500);

            const body = await response.json();
            expect(body).toEqual({ error: "Internal Server Error" });
        });
    });

    describe("noContent()", () => {
        test("should create 204 response with no body", () => {
            const response = ResponseHelpers.noContent();

            expect(response.status).toBe(204);
            expect(response.body).toBeNull();
        });
    });

    describe("created()", () => {
        test("should create 201 response with data", async () => {
            const data = { id: 1, name: "New Item" };
            const response = ResponseHelpers.created(data);

            expect(response.status).toBe(201);

            const body = await response.json();
            expect(body).toEqual(data);
        });

        test("should create 201 response with location header", () => {
            const response = ResponseHelpers.created({ id: 1 }, "/items/1");

            expect(response.headers.get("Location")).toBe("/items/1");
        });

        test("should create 201 response with default success message", async () => {
            const response = ResponseHelpers.created();

            const body = await response.json();
            expect(body).toEqual({ success: true });
        });
    });

    describe("file()", () => {
        test("should serve file with correct content", async () => {
            const testFile = Bun.file(`${import.meta.dir}/ResponseHelpers.test.ts`);
            const response = ResponseHelpers.file(testFile);

            expect(response).toBeInstanceOf(Response);
            const body = await response.text();
            expect(body).toContain("ResponseHelpers");
        });

        test("should use inline disposition by default", () => {
            const testFile = Bun.file(`${import.meta.dir}/ResponseHelpers.test.ts`);
            const response = ResponseHelpers.file(testFile);

            const disposition = response.headers.get("Content-Disposition");
            expect(disposition).toBeNull();
        });

        test("should use attachment disposition when download=true", () => {
            const testFile = Bun.file(`${import.meta.dir}/ResponseHelpers.test.ts`);
            const response = ResponseHelpers.file(testFile, { download: true });

            const disposition = response.headers.get("Content-Disposition");
            expect(disposition).toContain("attachment");
            expect(disposition).toContain('filename="ResponseHelpers.test.ts"');
        });

        test("should use custom filename when provided", () => {
            const testFile = Bun.file(`${import.meta.dir}/ResponseHelpers.test.ts`);
            const response = ResponseHelpers.file(testFile, {
                filename: "custom-name.ts",
            });

            const disposition = response.headers.get("Content-Disposition");
            expect(disposition).toContain("inline");
            expect(disposition).toContain('filename="custom-name.ts"');
        });

        test("should use custom filename with download", () => {
            const testFile = Bun.file(`${import.meta.dir}/ResponseHelpers.test.ts`);
            const response = ResponseHelpers.file(testFile, {
                download: true,
                filename: "download.ts",
            });

            const disposition = response.headers.get("Content-Disposition");
            expect(disposition).toContain("attachment");
            expect(disposition).toContain('filename="download.ts"');
        });

        test("should respect additional headers", () => {
            const testFile = Bun.file(`${import.meta.dir}/ResponseHelpers.test.ts`);
            const response = ResponseHelpers.file(testFile, {
                headers: { "X-Custom-Header": "test-value" },
            });

            expect(response.headers.get("X-Custom-Header")).toBe("test-value");
        });
    });

    describe("Edge Cases", () => {
        describe("json() edge cases", () => {
            test("should handle empty object", async () => {
                const response = ResponseHelpers.json({});
                const body = await response.json();
                expect(body).toEqual({});
            });

            test("should handle nested objects", async () => {
                const data = {
                    user: { address: { city: "NYC" }, name: "John" },
                };
                const response = ResponseHelpers.json(data);
                const body = await response.json();
                expect(body).toEqual(data);
            });

            test("should handle arrays", async () => {
                const data = [1, 2, 3];
                const response = ResponseHelpers.json(data);
                const body = await response.json();
                expect(body).toEqual(data);
            });
        });

        describe("redirect() edge cases", () => {
            test("should handle redirect with 301 permanent", () => {
                const response = ResponseHelpers.redirect("/new-location", {
                    status: 301,
                });
                expect(response.status).toBe(301);
            });

            test("should handle redirect with 303 See Other", () => {
                const response = ResponseHelpers.redirect("/other", {
                    status: 303,
                });
                expect(response.status).toBe(303);
            });

            test("should handle redirect with 307 Temporary", () => {
                const response = ResponseHelpers.redirect("/temp", {
                    status: 307,
                });
                expect(response.status).toBe(307);
            });

            test("should handle redirect with 308 Permanent", () => {
                const response = ResponseHelpers.redirect("/permanent", {
                    status: 308,
                });
                expect(response.status).toBe(308);
            });
        });

        describe("html() edge cases", () => {
            test("should handle empty HTML", async () => {
                const response = ResponseHelpers.html("");
                const body = await response.text();
                expect(body).toBe("");
            });

            test("should handle HTML with special characters", async () => {
                const html = '<p>&lt;script&gt;alert("xss")&lt;/script&gt;</p>';
                const response = ResponseHelpers.html(html);
                const body = await response.text();
                expect(body).toBe(html);
            });
        });
    });
});
