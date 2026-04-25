import { describe, expect, test } from "vite-plus/test";
import { applyLogic, rule } from "../src/index.ts";

describe("rule builder", () => {
  test("eq → ===, applyLogic agrees", () => {
    expect(rule.eq(1, 1)).toEqual({ "===": [1, 1] });
    expect(applyLogic(rule.eq(1, 1), {})).toBe(true);
    expect(applyLogic(rule.eq("1", 1), {})).toBe(false);
  });

  test("looseEq, notEq, looseNotEq", () => {
    expect(rule.looseEq("1", 1)).toEqual({ "==": ["1", 1] });
    expect(applyLogic(rule.looseEq("1", 1), {})).toBe(true);
    expect(rule.notEq(1, 2)).toEqual({ "!==": [1, 2] });
    expect(applyLogic(rule.notEq(1, 2), {})).toBe(true);
    expect(rule.looseNotEq(1, "1")).toEqual({ "!=": [1, "1"] });
    expect(applyLogic(rule.looseNotEq(1, "1"), {})).toBe(false);
  });

  test("and, or, not", () => {
    expect(rule.and(true, true, false)).toEqual({ and: [true, true, false] });
    expect(applyLogic(rule.and(true, true), {})).toBe(true);
    expect(applyLogic(rule.or(false, true), {})).toBe(true);
    expect(rule.not(false)).toEqual({ "!": [false] });
    expect(applyLogic(rule.not(false), {})).toBe(true);
  });

  test("comparison operators", () => {
    expect(rule.lt(1, 2)).toEqual({ "<": [1, 2] });
    expect(applyLogic(rule.lt(1, 2), {})).toBe(true);
    expect(applyLogic(rule.lte(1, 1), {})).toBe(true);
    expect(applyLogic(rule.gt(2, 1), {})).toBe(true);
    expect(applyLogic(rule.gte(2, 2), {})).toBe(true);
  });

  test("arithmetic", () => {
    expect(rule.add(1, 2, 3)).toEqual({ "+": [1, 2, 3] });
    expect(applyLogic(rule.add(1, 2, 3), {})).toBe(6);
    expect(applyLogic(rule.sub(5, 2), {})).toBe(3);
    expect(applyLogic(rule.sub(5), {})).toBe(-5);
    expect(applyLogic(rule.mul(2, 3, 4), {})).toBe(24);
    expect(applyLogic(rule.div(10, 2), {})).toBe(5);
    expect(applyLogic(rule.mod(7, 3), {})).toBe(1);
  });

  test("var / accessor with optional fallback", () => {
    expect(rule.var("a")).toEqual({ var: ["a"] });
    expect(applyLogic(rule.var("a"), { a: 42 })).toBe(42);
    expect(rule.var("missing", 99)).toEqual({ var: ["missing", 99] });
    expect(applyLogic(rule.var("missing", 99), {})).toBe(99);
  });

  test("higher-order: some, all, none, map, filter", () => {
    const items = { items: [1, 2, 3] };
    const positive = rule.gt(rule.var(""), 0);
    const negative = rule.lt(rule.var(""), 0);
    expect(applyLogic(rule.some(rule.var("items"), positive), items)).toBe(true);
    expect(applyLogic(rule.all(rule.var("items"), positive), items)).toBe(true);
    expect(applyLogic(rule.none(rule.var("items"), negative), items)).toBe(true);
    expect(applyLogic(rule.map(rule.var("items"), rule.mul(rule.var(""), 2)), items)).toEqual([
      2, 4, 6,
    ]);
    expect(applyLogic(rule.filter(rule.var("items"), positive), items)).toEqual([1, 2, 3]);
  });

  test("composes deep rules", () => {
    const r = rule.and(rule.eq(rule.var("user.age"), 21), rule.gt(rule.var("score"), 100));
    expect(applyLogic(r, { user: { age: 21 }, score: 150 })).toBe(true);
    expect(applyLogic(r, { user: { age: 22 }, score: 150 })).toBe(false);
  });
});
