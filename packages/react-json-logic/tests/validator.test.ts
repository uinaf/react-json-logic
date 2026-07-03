import { describe, expect, test } from "vitest";
import { rule, validate } from "../src/index.ts";

describe("validate", () => {
  test("accepts primitives and bare data", () => {
    expect(validate("hello")).toEqual({ ok: true });
    expect(validate(42)).toEqual({ ok: true });
    expect(validate(true)).toEqual({ ok: true });
    expect(validate(null)).toEqual({ ok: true });
    expect(validate({})).toEqual({ ok: true });
  });

  test("accepts a well-formed builder rule", () => {
    expect(validate(rule.eq(1, 1))).toEqual({ ok: true });
    expect(validate(rule.and(rule.eq(1, 1), rule.gt(2, 1)))).toEqual({ ok: true });
    expect(validate(rule.some(rule.var("items"), rule.gt(rule.var(""), 0)))).toEqual({ ok: true });
  });

  test("flags an operator object with multiple keys", () => {
    const result = validate({ "===": [1, 1], "+": [1, 2] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.message).toMatch(/exactly one key/);
    }
  });

  test("flags arity below minimum", () => {
    // === expects 2 args
    const result = validate({ "===": [1] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.message).toMatch(/at least 2/);
      expect(result.errors[0]?.path).toBe("$.===");
    }
  });

  test("flags arity above maximum", () => {
    // < expects exactly 2 args
    const result = validate({ "<": [1, 2, 3] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]?.message).toMatch(/at most 2/);
    }
  });

  test("walks nested rules and reports child errors", () => {
    // outer is ok, inner === has only 1 arg
    const result = validate({ and: [{ "===": [1] }, true] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.path).toBe("$.and[0].===");
    }
  });

  test("tolerates unknown operators (custom ops)", () => {
    // json-logic-js allows registering custom operators via add_operation.
    // The validator should not error on unknown keys, only on structural issues.
    expect(validate({ myCustomOp: [1, 2, 3] })).toEqual({ ok: true });
  });

  test("tolerates the => wrapper used by the higher-order UI", () => {
    expect(validate({ "=>": [{ "===": [1, 1] }] })).toEqual({ ok: true });
  });
});
