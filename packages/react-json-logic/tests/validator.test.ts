import { describe, expect, test } from "vite-plus/test";
import { applyLogic, validate, type JsonLogicValue, type ValidationError } from "../src/index.ts";

function validationErrors(value: unknown): ValidationError[] {
  const result = validate(value);
  if (result.ok) throw new Error(`expected validation errors for ${JSON.stringify(value)}`);
  return result.errors;
}

describe("validate", () => {
  test("accepts primitives and bare data", () => {
    expect(validate("hello")).toEqual({ ok: true });
    expect(validate(42)).toEqual({ ok: true });
    expect(validate(true)).toEqual({ ok: true });
    expect(validate(null)).toEqual({ ok: true });
    expect(validate({})).toEqual({ ok: true });
  });

  test("flags an operator object with multiple keys", () => {
    const errors = validationErrors({ "===": [1, 1], "+": [1, 2] });
    expect(errors[0]?.message).toMatch(/exactly one key/);
  });

  test("flags arity below minimum", () => {
    const errors = validationErrors({ "===": [1] });
    expect(errors[0]?.message).toMatch(/at least 2/);
    expect(errors[0]?.path).toBe("$.===");
  });

  test.each<{ rule: JsonLogicValue; result: unknown }>([
    { rule: { "<": [1, 2, 3] }, result: true },
    { rule: { "<": [1, 3, 2] }, result: false },
    { rule: { "<=": [1, 2, 2] }, result: true },
    { rule: { "<=": [2, 1, 3] }, result: false },
    { rule: { if: [true, "yes"] }, result: "yes" },
    { rule: { if: [false, "yes"] }, result: null },
  ])("accepts evaluator-supported $rule", ({ rule, result }) => {
    expect(applyLogic(rule)).toEqual(result);
    expect(validate(rule)).toEqual({ ok: true });
  });

  test("flags arity above maximum", () => {
    const errors = validationErrors({ "<": [1, 2, 3, 4] });
    expect(errors[0]?.message).toMatch(/at most 3/);
  });

  test("walks nested rules and reports child errors", () => {
    const errors = validationErrors({ and: [{ "===": [1] }, true] });
    expect(errors).toHaveLength(1);
    expect(errors[0]?.path).toBe("$.and[0].===");
  });

  test("tolerates unknown operators (custom ops)", () => {
    expect(validate({ myCustomOp: [1, 2, 3] })).toEqual({ ok: true });
  });

  test("tolerates the => wrapper used by the higher-order UI", () => {
    expect(validate({ "=>": [{ "===": [1, 1] }] })).toEqual({ ok: true });
  });

  test("walks operator objects inside array literals", () => {
    const topLevelErrors = validationErrors([{ "===": [1] }]);
    expect(topLevelErrors[0]?.path).toBe("$[0].===");
    expect(topLevelErrors[0]?.message).toMatch(/at least 2/);

    const nestedErrors = validationErrors({ in: ["x", [{ "===": [1] }]] });
    expect(nestedErrors[0]?.path).toBe("$.in[1][0].===");
    expect(nestedErrors[0]?.message).toMatch(/at least 2/);
  });

  test("accepts record literals inside arrays", () => {
    expect(validate([{ id: 1, name: "one" }])).toEqual({ ok: true });
    expect(
      validate({
        map: [[{ id: 1, name: "one" }], { var: "id" }],
      }),
    ).toEqual({ ok: true });
  });

  test("flags non-array payloads that violate arity", () => {
    const equalityErrors = validationErrors({ "===": 1 });
    expect(equalityErrors[0]?.message).toMatch(/at least 2/);

    const andErrors = validationErrors({ and: true });
    expect(andErrors[0]?.message).toMatch(/at least 2/);
  });

  test("still accepts the var string shorthand", () => {
    expect(validate({ var: "a" })).toEqual({ ok: true });
  });

  test("walks a nested operator inside a non-array payload", () => {
    const errors = validationErrors({ "!": { "===": [1] } });
    expect(errors).toHaveLength(1);
    expect(errors[0]?.path).toBe("$.!.===");
    expect(errors[0]?.message).toMatch(/at least 2/);
  });
});
