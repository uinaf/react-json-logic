import { describe, expect, test } from "vite-plus/test";
import {
  applyLogic,
  rule,
  validate,
  type JsonLogicValue,
  type ValidationError,
} from "../src/index.ts";

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

  test.each<{ name: string; value: JsonLogicValue; result: unknown }>([
    { name: "add", value: rule.add(), result: 0 },
    { name: "and", value: rule.and(), result: undefined },
    { name: "or", value: rule.or(), result: undefined },
    { name: "if", value: rule.if(), result: null },
    { name: "min", value: rule.min(), result: Infinity },
    { name: "max", value: rule.max(), result: -Infinity },
    { name: "missing", value: rule.missing(), result: [] },
    { name: "cat", value: rule.cat(), result: "" },
    { name: "merge", value: rule.merge(), result: [] },
  ])("accepts empty $name as evaluated", ({ value, result }) => {
    expect(applyLogic(value)).toEqual(result);
    expect(validate(value)).toEqual({ ok: true });
  });

  test("multiplication needs one operand because the evaluator reduces without a seed", () => {
    expect(() => applyLogic(rule.mul())).toThrow(TypeError);
    expect(validationErrors(rule.mul())[0]?.message).toMatch(/at least 1/);
    expect(applyLogic(rule.mul(7))).toBe(7);
    expect(validate(rule.mul(7))).toEqual({ ok: true });
  });

  const operands = Array.from({ length: 101 }, () => 1);
  const keys = Array.from({ length: 101 }, (_, index) => `key${index}`);
  test.each<{ name: string; value: JsonLogicValue; result: unknown }>([
    { name: "add", value: rule.add(...operands), result: 101 },
    { name: "mul", value: rule.mul(...operands), result: 1 },
    { name: "and", value: rule.and(...operands), result: 1 },
    { name: "or", value: rule.or(...operands), result: 1 },
    {
      name: "if",
      value: rule.if(...Array.from({ length: 100 }, () => false), "else"),
      result: "else",
    },
    { name: "min", value: rule.min(...operands), result: 1 },
    { name: "max", value: rule.max(...operands), result: 1 },
    { name: "missing", value: rule.missing(...keys), result: keys },
    { name: "cat", value: rule.cat(...operands), result: "1".repeat(101) },
    { name: "merge", value: rule.merge(...operands), result: operands },
  ])("accepts over-cap $name as evaluated", ({ value, result }) => {
    expect(applyLogic(value)).toEqual(result);
    expect(validate(value)).toEqual({ ok: true });
  });

  test("checks nested rules beyond the editor cap", () => {
    const value = rule.add(...operands, { "===": [1] });
    expect(validationErrors(value)).toEqual([
      { path: "$.+[101].===", message: "===: expected at least 2 arg(s), got 1" },
    ]);
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

    expect(applyLogic({ and: true })).toBe(true);
    expect(validate({ and: true })).toEqual({ ok: true });
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
