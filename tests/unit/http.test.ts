import { describe, expect, it } from "vitest";
import { assertDeclaredUploadSize } from "@/lib/http";

describe("assertDeclaredUploadSize", () => {
  const MAX = 10 * 1024 * 1024;

  it("accepts a declared size within the limit", () => {
    expect(() => assertDeclaredUploadSize(String(MAX - 1), MAX)).not.toThrow();
  });

  it("rejects a declared size over the limit (413)", () => {
    try {
      assertDeclaredUploadSize(String(MAX * 10), MAX);
      throw new Error("should have thrown");
    } catch (e) {
      expect(e).toMatchObject({ status: 413, code: "too_large" });
    }
  });

  it("rejects a missing Content-Length header (regression: used to silently skip the size check)", () => {
    try {
      assertDeclaredUploadSize(null, MAX);
      throw new Error("should have thrown");
    } catch (e) {
      expect(e).toMatchObject({ status: 400, code: "bad_request" });
    }
  });

  it("rejects a non-numeric Content-Length (regression: chunked transfer-encoding bypass)", () => {
    for (const bad of ["", "not-a-number", "0", "-5"]) {
      expect(() => assertDeclaredUploadSize(bad, MAX)).toThrow();
    }
  });
});
